import { Request, Response } from "express";
import { Types } from "mongoose";

import Application from "../models/Application.js";
import InterviewPrep from "../models/InterviewPrep.js";
import { generateInterviewPrep } from "../services/interviewPrep.service.js";

import type { ApplicationDocument } from "../types/mongoose.types.js";
import { CVData, JobData } from "../types/types.js";
import { MatchData } from "../types/application.types.js";
import { auditLog } from "../middleware/log/audit.logger.js";

// ─────────────────────────────────────────────────────────────
// Type guard
// ─────────────────────────────────────────────────────────────

function isPopulated<T extends object>(doc: T | Types.ObjectId): doc is T {
  return doc !== null && typeof doc === "object" && !Array.isArray(doc) && "parsed" in doc;
}
// POST /api/interview/generate

export const generatePrep = async (req: Request, res: Response) => {
  try {
    const { applicationId } = req.body;
    const identity = req.identity;

    if (!identity) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const identityId = identity.id;
    const ownerType = identity.type;

    if (!applicationId) {
      return res.status(400).json({ error: "applicationId is required." });
    }

    const application = (await Application.findOne({
      _id: applicationId,
      ownerId: identityId,
      ownerType,
    })
      .populate("cv")
      .populate("job")
      .lean()) as unknown as ApplicationDocument;

    if (!application) {
      return res.status(404).json({ error: "Application not found." });
    }

    if (!isPopulated(application.cv) || !isPopulated(application.job)) {
      return res.status(400).json({ error: "CV or Job is not populated." });
    }

    const cv: CVData = application.cv.parsed;
    const job: JobData = application.job.parsed;
    const match: MatchData | undefined = application.match;

    if (!cv || !job) {
      return res.status(400).json({ error: "Application is missing CV or job data." });
    }

    if (!match) {
      return res.status(400).json({ error: "Application is missing match data." });
    }

    const prep = await generateInterviewPrep(cv, job, match, applicationId);

    const saved = await InterviewPrep.findOneAndUpdate(
      { application: applicationId, ownerId: identityId, ownerType },
      {
        application: applicationId,
        ownerId: identityId,
        ownerType,
        questions: prep.questions,
        general_tips: prep.general_tips,
      },
      { upsert: true, new: true },
    );

    await auditLog({
      event: "INTERVIEW_PREP_GENERATED",
      userId: identityId,
      userType: ownerType,
      requestId: req.requestId,
      ip: req.ip,
      resourceId: applicationId,
      metadata: {
        questionCount: prep.questions.length,
        prepId: String(saved._id),
      },
    });

    return res.status(201).json({ prep: saved });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[generatePrep]", message);
    return res.status(500).json({ error: message });
  }
};

// GET /api/interview/:applicationId

export const getPrep = async (req: Request, res: Response) => {
  try {
    const { applicationId } = req.params;
    const identity = req.identity;

    if (!identity) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const ownerId = identity.id;
    const ownerType = identity.type;

    const prep = await InterviewPrep.findOne({
      application: applicationId,
      ownerId,
      ownerType,
    });

    if (!prep) {
      return res.status(404).json({
        error: "No interview prep found. Generate one first.",
      });
    }

    return res.json({ prep });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[getPrep]", message);
    return res.status(500).json({ error: message });
  }
};
