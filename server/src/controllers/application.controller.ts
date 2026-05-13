import { Request, Response } from "express";
import { Types, Document } from "mongoose";

import CV from "../models/CV.js";
import Job from "../models/Job.js";
import Application from "../models/Application.js";

import { runApplicationPipeline } from "../services/pipeline.service.js";
import { extractJobData } from "../services/extractors.service.js";
import { matchCVToJob } from "../services/match.service.js";
import { generateApplication } from "../services/application.service.js";
import { CVSchema } from "../types/schema.js";
import { ApplicationLLMOutput } from "../types/application.types.js";

// ── Document interfaces ───────────────────────────────────────────
// Explicit interfaces avoid relying on Mongoose's inferred return
// types from findById/create, which lose _id and field access.

interface CVParsed {
  name?: string;
  email?: string;
  phone?: string;
  github?: string;
  summary?: string;
  seniority_level?: string;
  skills: string[];
  experience: { title?: string; company?: string; highlights: string[] }[];
  education: { title?: string; school?: string }[];
}

interface CVDoc extends Document {
  _id: Types.ObjectId;
  rawText?: string;
  parsed?: CVParsed;
}

interface JobDoc extends Document {
  _id: Types.ObjectId;
  rawText?: string;
  parsed?: {
    title?: string;
    required_skills: string[];
    responsibilities: string[];
    seniority?: string;
  };
}

// ── Request body type ─────────────────────────────────────────────

type CreateApplicationBody = {
  cvText?: string;
  cvId?: string;
  jobText: string;
};

// ── Shared save helper ────────────────────────────────────────────

async function saveApplication(
  typedApp: ApplicationLLMOutput,
  match: Awaited<ReturnType<typeof matchCVToJob>>,
  cvId: Types.ObjectId,
  jobId: Types.ObjectId,
) {
  return Application.create({
    cv: cvId,
    job: jobId,

    match: {
      score: match.score,
      confidence: match.confidence,
      strengths: match.strengths,
      missing_skills: match.missing_skills,
    },

    tailored_cv_summary: typedApp.cv_summary,

    cover_letter: [
      typedApp.application_letter?.introduction,
      typedApp.application_letter?.body,
      typedApp.application_letter?.closing,
    ]
      .filter((v): v is string => typeof v === "string" && v.length > 0)
      .join("\n\n"),

    application_email: {
      subject: typedApp.email_template.subject,
      body: typedApp.email_template.body,
    },
  });
}

// ── Controller ────────────────────────────────────────────────────

export const createApplication = async (req: Request<{}, {}, CreateApplicationBody>, res: Response) => {
  try {
    const { cvText, cvId, jobText } = req.body;

    // ── Path A: cvId — reuse existing CV, skip CV parsing ─────────
    if (cvId) {
      const existingCV = (await CV.findById(cvId).lean()) as CVDoc | null;

      if (!existingCV) {
        return res.status(404).json({
          error: "CV not found. Please upload your CV again.",
        });
      }

      const cv = CVSchema.parse(existingCV.parsed);
      const job = await extractJobData(jobText);
      const match = await matchCVToJob(cv, job);
      const application = (await generateApplication(cv, job, match)) as ApplicationLLMOutput;

      const savedJob = (await Job.create({ rawText: jobText, parsed: job })) as unknown as JobDoc;

      const savedApplication = await saveApplication(application, match, existingCV._id, savedJob._id);

      return res.status(201).json({
        application: savedApplication,
        cv: existingCV,
        job: savedJob,
      });
    }

    // ── Path B: cvText — full pipeline ────────────────────────────
    const { cv, job, match, application } = await runApplicationPipeline(cvText!, jobText);

    const validatedCV = CVSchema.parse(cv);
    const typedApplication = application as ApplicationLLMOutput;

    const savedCV = (await CV.create({ rawText: cvText, parsed: validatedCV })) as unknown as CVDoc;
    const savedJob = (await Job.create({ rawText: jobText, parsed: job })) as unknown as JobDoc;

    const savedApplication = await saveApplication(typedApplication, match, savedCV._id, savedJob._id);

    return res.status(201).json({
      application: savedApplication,
      cv: savedCV,
      job: savedJob,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[createApplication]", message);
    return res.status(500).json({ error: message });
  }
};
