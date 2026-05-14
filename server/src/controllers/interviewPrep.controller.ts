import { Request, Response } from "express";

import Application from "../models/Application.js";
import InterviewPrep from "../models/InterviewPrep.js";
import { generateInterviewPrep } from "../services/interviewPrep.service.js";

import type { CVSchema, JobSchema } from "../types/schemas/schema.js";
import type { MatchReport } from "../types/match.types.js";

import { auditLog } from "../middleware/log/audit.logger.js";
import { getParam } from "../utils/req.js";
import { z } from "zod";

export type CVSchemaData = z.infer<typeof CVSchema>;
export type JobSchemaData = z.infer<typeof JobSchema>;

// ─────────────────────────────────────────────
// Type guard (populated doc check)
// ─────────────────────────────────────────────

function isPopulated(doc: unknown): doc is { parsed: unknown } {
  return typeof doc === "object" && doc !== null && "parsed" in doc;
}

// ─────────────────────────────────────────────
// POST /api/interview/:applicationId
// ─────────────────────────────────────────────
export const generatePrep = async (req: Request, res: Response) => {
  try {
    const applicationId = getParam(req.params.applicationId);

    const identity = req.identity;

    if (!identity) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const application = await Application.findOne({
      _id: applicationId,
      ownerId: identity.id,
      ownerType: identity.type,
    })
      .populate("cv")
      .populate("job");

    if (!application) {
      return res.status(404).json({
        error: "Application not found.",
      });
    }

    if (!isPopulated(application.cv) || !isPopulated(application.job)) {
      return res.status(400).json({
        error: "CV or Job is not populated.",
      });
    }

    // ── SAFE CASTS (this is where types are fixed)
    const cv = application.cv.parsed as CVSchemaData;
    const job = application.job.parsed as JobSchemaData;
    const match = application.match as MatchReport | undefined;

    if (!match) {
      return res.status(400).json({
        error: "Missing match data.",
      });
    }

    const prep = await generateInterviewPrep(cv, job, match, applicationId);

    const saved = await InterviewPrep.findOneAndUpdate(
      {
        application: applicationId,
        ownerId: identity.id,
        ownerType: identity.type,
      },
      {
        application: applicationId,
        ownerId: identity.id,
        ownerType: identity.type,
        questions: prep.questions,
        general_tips: prep.general_tips,
      },
      {
        upsert: true,
        new: true,
      },
    );

    await auditLog({
      event: "INTERVIEW_PREP_GENERATED",
      userId: identity.id,
      userType: identity.type,
      requestId: req.requestId,
      ip: req.ip,
      resourceId: applicationId,
      metadata: {
        questionCount: prep.questions.length,
        prepId: String(saved._id),
      },
    });

    return res.status(201).json({
      prep: saved,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";

    console.error("[generatePrep]", message);

    return res.status(500).json({
      error: message,
    });
  }
};

// ─────────────────────────────────────────────
// GET /api/interview/:applicationId
// ─────────────────────────────────────────────

export const getPrep = async (req: Request, res: Response) => {
  try {
    const applicationId = getParam(req.params.applicationId);

    const identity = req.identity;

    if (!identity) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const prep = await InterviewPrep.findOne({
      application: applicationId,
      ownerId: identity.id,
      ownerType: identity.type,
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

    return res.status(500).json({
      error: message,
    });
  }
};
