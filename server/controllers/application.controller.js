import CV from "../models/CV.js";
import Job from "../models/Job.js";
import Application from "../models/Application.js";

import { matchCVToJob } from "../services/matches.service.js";
import { extractJobData, extractCVData } from "../services/extractors.service.js";
import { generateApplication } from "../services/application.service.js";

export const createApplication = async (req, res) => {
  try {
    const { cvText, jobText } = req.body;

    if (!cvText || !jobText) {
      return res.status(400).json({ error: "cvText and jobText are required." });
    }

    // ── Step 1: Parse CV + job in parallel ────────────────────────────────
    const [cv, job] = await Promise.all([extractCVData(cvText), extractJobData(jobText)]);

    // ── Step 2: Match (local, synchronous) ────────────────────────────────
    const match = matchCVToJob(cv, job);

    // ── Step 3: Generate application ──────────────────────────────────────
    const application = await generateApplication(cv, job, match);

    // ── Step 4: Persist CV + job in parallel ──────────────────────────────
    const [savedCV, savedJob] = await Promise.all([
      CV.create({ rawText: cvText, parsed: cv }),
      Job.create({ rawText: jobText, parsed: job }),
    ]);

    // ── Step 5: Persist application ───────────────────────────────────────
    // Maps matchCVToJob + LLM output fields to the Application schema shape.
    const savedApplication = await Application.create({
      cv: savedCV._id,
      job: savedJob._id,

      // matchCVToJob returns `matching_skills` — schema calls it `strengths`
      match: {
        score: match.score,
        confidence: match.confidence,
        strengths: match.matching_skills,
        missing_skills: match.missing_skills,
      },

      // LLM returns `cv_summary` — schema calls it `tailored_cv_summary`
      tailored_cv_summary: application.cv_summary,

      // LLM returns `application_letter` as { introduction, body, closing }
      // Schema stores `cover_letter` as a flat string — join the parts
      cover_letter: [
        application.application_letter?.introduction,
        application.application_letter?.body,
        application.application_letter?.closing,
      ]
        .filter(Boolean)
        .join("\n\n"),

      // LLM returns `email_template` — schema calls it `application_email`
      application_email: {
        subject: application.email_template?.subject,
        body: application.email_template?.body,
      },
    });

    // ── Step 6: Respond ───────────────────────────────────────────────────
    return res.status(201).json({
      application: savedApplication,
      cv: savedCV,
      job: savedJob,
    });
  } catch (err) {
    const status = err instanceof TypeError ? 400 : 500;
    console.error("[createApplication]", err.message);
    return res.status(status).json({ error: err.message });
  }
};
