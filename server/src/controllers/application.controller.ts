import { Request, Response } from "express";

import CV from "../models/CV.js";
import Job from "../models/Job.js";
import Application from "../models/Application.js";

import { runApplicationPipeline } from "../services/pipeline.service.js";

// ── Request body type ─────────────────────────────────────────────
type CreateApplicationBody = {
  cvText: string;
  jobText: string;
};

// ── LLM output type ───────────────────────────────────────────────
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
      return res.status(400).json({
        error: "cvText and jobText are required.",
      });
    }

    // ── Run full pipeline ────────────────────────────────────────
    const { cv, job, match, application } = await runApplicationPipeline(cvText, jobText);

    const typedApplication = application as ApplicationLLMOutput;

    // ── Persist CV + Job ────────────────────────────────────────
    const [savedCV, savedJob] = await Promise.all([
      CV.create({
        rawText: cvText,
        parsed: cv,
      }),
      Job.create({
        rawText: jobText,
        parsed: job,
      }),
    ]);

    // ── Persist generated application ───────────────────────────
    const savedApplication = await Application.create({
      cv: savedCV._id,
      job: savedJob._id,

      match: {
        score: match.score,
        confidence: match.confidence,
        strengths: match.strengths,
        missing_skills: match.missing_skills,
      },

      tailored_cv_summary: typedApplication.cv_summary,

      cover_letter: [
        typedApplication.application_letter?.introduction,
        typedApplication.application_letter?.body,
        typedApplication.application_letter?.closing,
      ]
        .filter((v): v is string => typeof v === "string" && v.length > 0)
        .join("\n\n"),

      application_email: {
        subject: typedApplication.email_template.subject,
        body: typedApplication.email_template.body,
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

    return res.status(500).json({
      error: message,
    });
  }
};
