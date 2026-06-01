import { Response, Request } from "express";

import Application, { APPLICATION_STATUSES } from "../models/Application.js";

import { auditLog } from "../middleware/log/audit.logger.js";

import { getParam } from "../utils/req.js";

import { matchCVToJob } from "../services/match.service.js";
import { generateApplication } from "../services/application.service.js";
import CVModel from "../models/CV.js";
import JobModel from "../models/Job.js";
import { repairCV } from "../services/repair/cvRepair.service.js";
import { repairJob } from "../services/repair/jobRepair.service.js";

// ─────────────────────────────────────────────
// GET /api/application
// ─────────────────────────────────────────────

export const getApplications = async (req: Request, res: Response) => {
  try {
    if (!req.identity) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const { id: ownerId, type: ownerType } = req.identity;

    const applications = await Application.find({
      ownerId,
      ownerType,
    })
      .populate("cv", "parsed applicationsCount lastUsedAt")
      .populate("job", "parsed company location")
      .sort({ createdAt: -1 });

    return res.json({
      applications,
    });
  } catch (err) {
    console.error("[getApplications]", err);

    return res.status(500).json({
      error: "Failed to fetch applications",
    });
  }
};

// ─────────────────────────────────────────────
// GET /api/application/:id
// ─────────────────────────────────────────────

export const getApplicationById = async (req: Request, res: Response) => {
  try {
    if (!req.identity) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const { id: ownerId, type: ownerType } = req.identity;
    const id = getParam(req.params.id);

    const application = await Application.findOne({
      _id: id,
      ownerId,
      ownerType,
    })
      .select(
        `
    _id
    jobTitleSnapshot
    companySnapshot
    cvNameSnapshot
    match
    status
    createdAt
    notes
    tailored_cv_summary
    cover_letter
    application_email
  `,
      )
      .lean();

    if (!application) {
      return res.status(404).json({
        error: "Application not found",
      });
    }

    return res.json({
      application,
    });
  } catch (err) {
    console.error("[getApplicationById]", err);

    return res.status(500).json({
      error: "Failed to fetch application",
    });
  }
};

// ─────────────────────────────────────────────
// PATCH /api/application/:id/status
// ─────────────────────────────────────────────

export const updateApplicationStatus = async (req: Request, res: Response) => {
  try {
    if (!req.identity) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const { id: ownerId, type: ownerType } = req.identity;
    const id = getParam(req.params.id);
    const { status } = req.body;

    if (!APPLICATION_STATUSES.includes(status as any)) {
      return res.status(400).json({
        error: `Invalid status. Must be one of: ${APPLICATION_STATUSES.join(", ")}`,
      });
    }

    const updated = await Application.findOneAndUpdate(
      {
        _id: id,
        ownerId,
        ownerType,
      },
      {
        $set: { status },
      },
      {
        new: true,
      },
    );

    if (!updated) {
      return res.status(404).json({
        error: "Application not found",
      });
    }

    await auditLog({
      event: "APPLICATION_STATUS_UPDATED",
      userId: ownerId,
      userType: ownerType,
      resourceId: id,
      requestId: req.requestId,
      ip: req.ip,
      metadata: {
        status,
      },
    });

    return res.json({
      application: updated,
    });
  } catch (err) {
    console.error("[updateApplicationStatus]", err);

    return res.status(500).json({
      error: "Failed to update status",
    });
  }
};

// ─────────────────────────────────────────────
// DELETE /api/application/:id
// ─────────────────────────────────────────────

export const deleteApplication = async (req: Request, res: Response) => {
  try {
    if (!req.identity) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const { id: ownerId, type: ownerType } = req.identity;
    const id = getParam(req.params.id);

    const deleted = await Application.findOneAndDelete({
      _id: id,
      ownerId,
      ownerType,
    });

    if (!deleted) {
      return res.status(404).json({
        error: "Application not found",
      });
    }

    await auditLog({
      event: "APPLICATION_DELETED",
      userId: ownerId,
      userType: ownerType,
      resourceId: id,
      requestId: req.requestId,
      ip: req.ip,
    });

    return res.json({
      message: "Application deleted",
    });
  } catch (err) {
    console.error("[deleteApplication]", err);

    return res.status(500).json({
      error: "Failed to delete application",
    });
  }
};

export const createApplication = async (req: Request, res: Response) => {
  try {
    if (!req.identity) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { id: ownerId, type: ownerType } = req.identity;
    const { cvId, jobId } = req.body;

    if (!cvId || !jobId) {
      return res.status(400).json({
        error: "cvId and jobId are required",
      });
    }

    const cv = await CVModel.findOne({ _id: cvId, ownerId, ownerType });
    const job = await JobModel.findOne({ _id: jobId, ownerId, ownerType });

    if (!cv || !job) {
      return res.status(404).json({
        error: "CV or Job not found",
      });
    }

    if (!cv.parsed) {
      return res.status(404).json({
        error: "CV not parsed",
      });
    }

    // normalize inputs
    const cleanCV = repairCV(cv.parsed);
    const cleanJob = repairJob(job.parsed);

    // match
    const match = await matchCVToJob(cleanCV, cleanJob);

    // generate LLM output
    const applicationOutput = await generateApplication(cleanCV, cleanJob, match);

    const application = await Application.create({
      ownerId,
      ownerType,
      cv: cv._id,
      job: job._id,

      cvNameSnapshot: cv.parsed?.name?.trim() || "CV",

      jobTitleSnapshot: job.parsed?.title?.trim() || "Untitled Role",
      companySnapshot: job.company?.trim() || "Unknown Company",

      match,

      tailored_cv_summary: applicationOutput.cv_summary,

      cover_letter: [
        applicationOutput.application_letter.introduction,
        applicationOutput.application_letter.body,
        applicationOutput.application_letter.closing,
      ].join("\n\n"),

      application_email: applicationOutput.email_template,

      status: "generated",
    });

    await auditLog({
      event: "APPLICATION_CREATED",
      userId: ownerId,
      userType: ownerType,
      resourceId: String(application._id),
      requestId: req.requestId,
      ip: req.ip,
    });

    return res.status(201).json({ application });
  } catch (err) {
    console.error("[createApplication]", err);
    return res.status(500).json({ error: "Failed to create application" });
  }
};
