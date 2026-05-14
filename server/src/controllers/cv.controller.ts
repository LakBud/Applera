import CVModel from "../models/CV.js";
import { Request, Response } from "express";

import { extractTextFromPdf } from "../lib/pdfParser.js";
import { extractCVData } from "../services/extractors.service.js";

import { auditLog } from "../middleware/log/audit.logger.js";
import { normalizeParsedCV } from "../utils/cv.normalize.utils.js";

import { getParam } from "../utils/req.js";

type UploadedFile = Express.Multer.File;

// ─────────────────────────────────────────────
// POST /api/cv
// ─────────────────────────────────────────────

export const createCV = async (req: Request, res: Response) => {
  try {
    if (!req.identity) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    let rawText: string;
    const file = req.file as UploadedFile | undefined;

    if (file?.buffer) {
      rawText = await extractTextFromPdf(file.buffer);
    } else if (req.body?.cvText?.trim()) {
      rawText = req.body.cvText.trim();
    } else {
      return res.status(400).json({
        error: "Provide a CV as PDF or text",
      });
    }

    const parsedRaw = await extractCVData(rawText);
    const parsed = normalizeParsedCV(parsedRaw);

    const createdCV = await CVModel.create({
      ownerId: req.identity.id,
      ownerType: req.identity.type,
      rawText,
      parsed,
    });

    await auditLog({
      event: "CV_CREATED",
      userId: req.identity.id,
      userType: req.identity.type,
      requestId: req.requestId,
      ip: req.ip,
      resourceId: String(createdCV._id),
      metadata: {
        cvId: String(createdCV._id),
      },
    });

    return res.status(201).json({
      message: "CV created successfully",
      cv: createdCV,
    });
  } catch (err: unknown) {
    console.error("[createCV]", err);

    return res.status(500).json({
      error: "Failed to create CV",
    });
  }
};

// ─────────────────────────────────────────────
// GET /api/cv
// ─────────────────────────────────────────────

export const getCVs = async (req: Request, res: Response) => {
  try {
    if (!req.identity) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const cvs = await CVModel.find({
      ownerId: req.identity.id,
      ownerType: req.identity.type,
    })
      .sort({ createdAt: -1 })
      .select("-rawText");

    return res.json(cvs);
  } catch (err) {
    console.error("[getCVs]", err);

    return res.status(500).json({
      error: "Failed to fetch CVs",
    });
  }
};

// ─────────────────────────────────────────────
// GET /api/cv/:id
// ─────────────────────────────────────────────

export const getCVById = async (req: Request, res: Response) => {
  try {
    if (!req.identity) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const id = getParam(req.params.id);

    const cvDoc = await CVModel.findOne({
      _id: id,
      ownerId: req.identity.id,
      ownerType: req.identity.type,
    });

    if (!cvDoc) {
      return res.status(404).json({
        error: "CV not found",
      });
    }

    return res.json(cvDoc);
  } catch (err) {
    console.error("[getCVById]", err);

    return res.status(500).json({
      error: "Failed to fetch CV",
    });
  }
};

// ─────────────────────────────────────────────
// DELETE /api/cv/:id
// ─────────────────────────────────────────────

export const deleteCV = async (req: Request, res: Response) => {
  try {
    if (!req.identity) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const id = getParam(req.params.id);

    const deleted = await CVModel.findOneAndDelete({
      _id: id,
      ownerId: req.identity.id,
      ownerType: req.identity.type,
    });

    if (!deleted) {
      return res.status(404).json({
        error: "CV not found",
      });
    }

    await auditLog({
      event: "CV_DELETED",
      userId: req.identity.id,
      userType: req.identity.type,
      requestId: req.requestId,
      ip: req.ip,
      resourceId: id,
      metadata: {
        cvId: id,
      },
    });

    return res.json({
      message: "CV deleted successfully",
    });
  } catch (err) {
    console.error("[deleteCV]", err);

    return res.status(500).json({
      error: "Failed to delete CV",
    });
  }
};
