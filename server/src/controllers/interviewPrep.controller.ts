import { Request, Response } from "express";

import Application from "../models/Application.js";
import InterviewPrep from "../models/InterviewPrep.js";
import { generateInterviewPrep } from "../services/interviewPrep.service.js";

import type { CVSchema, JobSchema } from "../types/schemas/schema.js";
import type { MatchReport } from "../types/match.types.js";

import { auditLog } from "../middleware/log/audit.logger.js";
import { getParam } from "../utils/req.js";
import { z } from "zod";
import CV from "../models/CV.js";
import Job from "../models/Job.js";

export type CVSchemaData = z.infer<typeof CVSchema>;
export type JobSchemaData = z.infer<typeof JobSchema>;

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
      .select("cv job match ownerId ownerType")
      .lean();

    if (!application) {
      return res.status(404).json({
        error: "Application not found.",
      });
    }

    // IMPORTANT: parsed must already exist on stored refs OR be fetched separately
    const cvDoc = await CV.findById(application.cv).select("parsed").lean();
    const jobDoc = await Job.findById(application.job).select("parsed").lean();

    const cv = cvDoc?.parsed;
    const job = jobDoc?.parsed;
    const match = application.match as MatchReport | undefined;

    if (!cv || !job) {
      return res.status(400).json({
        error: "Missing CV or Job parsed data.",
      });
    }

    if (!match) {
      return res.status(400).json({
        error: "Missing match data.",
      });
    }

    const prep = await generateInterviewPrep(cv as CVSchemaData, job as JobSchemaData, match, applicationId);

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
