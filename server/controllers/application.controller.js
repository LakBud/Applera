import CV from "../models/CV.js";
import Job from "../models/Job.js";
import Application from "../models/Application.js";

import { extractCVData } from "../services/ai.service.js";
import { parseJob } from "../services/jobParser.service.js";
import { matchCVtoJob } from "../services/match.service.js";
import { generateApplication } from "../services/applicationGenerator.service.js";

export const createApplication = async (req, res) => {
  try {
    const { cvText, jobText } = req.body;

    if (!cvText || !jobText) {
      return res.status(400).json({
        error: "cvText and jobText are required",
      });
    }

    // 1. Parse
    const cv = await extractCVData(cvText);
    const job = await parseJob(jobText);

    // 2. Match
    const match = matchCVtoJob(cv, job);

    // 3. AI generate
    const application = await generateApplication(cv, job, match);

    // 4. SAVE CV + JOB
    const savedCV = await CV.create({
      rawText: cvText,
      parsed: cv,
    });

    const savedJob = await Job.create({
      rawText: jobText,
      parsed: job,
    });

    // 5. SAVE APPLICATION
    const savedApplication = await Application.create({
      cv: savedCV._id,
      job: savedJob._id,

      match: application.match,
      tailored_cv_summary: application.tailored_cv_summary,
      cover_letter: application.cover_letter,
      application_email: application.application_email,
    });

    // 6. RETURN FINAL RESULT
    res.json({
      application: savedApplication,
      cv: savedCV,
      job: savedJob,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};
