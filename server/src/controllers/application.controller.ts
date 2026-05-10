import { Request, Response } from "express";

import CV from "../models/CV.js";
import Job from "../models/Job.js";
import Application from "../models/Application.js";

import { matchCVToJob } from "../services/matches.service.js";
import { extractJobData, extractCVData } from "../services/extractors.service.js";
import { generateApplication } from "../services/application.service.js";

// ── Request body type ─────────────────────────────────────────────
type CreateApplicationBody = {
  cvText: string;
  jobText: string;
};

// ── LLM types (IMPORTANT) ─────────────────────────────────────────
type ApplicationLLMOutput = {
  cv_summary: string;
  application_letter: {
    introduction?: string;
    body?: string;
    closing?: string;
  };
  email_template: {
    subject: string;
    body: string;
  };
};

// ── Controller ────────────────────────────────────────────────────
export const createApplication = async (req: Request<{}, {}, CreateApplicationBody>, res: Response) => {
  try {
    const { cvText, jobText } = req.body;

    if (!cvText || !jobText) {
      return res.status(400).json({ error: "cvText and jobText are required." });
    }

    // ── Step 1: Parse CV + job ─────────────────────────────────────
    const [cv, job] = await Promise.all([extractCVData(cvText), extractJobData(jobText)]);

    // ── Step 2: Match (sync) ───────────────────────────────────────
    const match = matchCVToJob(cv, job);

    // ── Step 3: Generate application (LLM) ─────────────────────────
    const application = (await generateApplication(cv, job, match)) as ApplicationLLMOutput;

    // ── Step 4: Persist CV + job ──────────────────────────────────
    const [savedCV, savedJob] = await Promise.all([
      CV.create({ rawText: cvText, parsed: cv }),
      Job.create({ rawText: jobText, parsed: job }),
    ]);

    // ── Step 5: Persist application ───────────────────────────────
    const savedApplication = await Application.create({
      cv: savedCV._id,
      job: savedJob._id,

      match: {
        score: match.score,
        confidence: match.confidence,
        strengths: match.matching_skills,
        missing_skills: match.missing_skills,
      },

      tailored_cv_summary: application.cv_summary,

      cover_letter: [
        application.application_letter?.introduction,
        application.application_letter?.body,
        application.application_letter?.closing,
      ]
        .filter((v): v is string => typeof v === "string" && v.length > 0)
        .join("\n\n"),

      application_email: {
        subject: application.email_template.subject,
        body: application.email_template.body,
      },
    });

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
