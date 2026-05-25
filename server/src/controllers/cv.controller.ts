import CVModel from "../models/CV.js";
import { Request, Response } from "express";

import { extractTextFromPdf } from "../lib/pdfParser.js";
import { extractCVData } from "../services/extractors.service.js";

import { auditLog } from "../middleware/log/audit.logger.js";
import { normalizeParsedCV } from "../utils/cv.normalize.utils.js";

import { getParam } from "../utils/req.js";
import { deleteCache, getCache, setCache } from "../lib/cache.js";
import { hash } from "../lib/hash.js";
import { uploadPDF } from "../lib/cloudinary.upload.js";
import { getPdfThumbnail } from "../utils/getPdfThumbnail.utils.js";

const cvHashKey = (userId: string, hash: string) => `cv:hash:${userId}:${hash}`;
const cvListKey = (userId: string, type: string) => `cvs:${userId}:${type}`;

// ─────────────────────────────────────────────
// POST /api/cv
// ─────────────────────────────────────────────

export const createCV = async (req: Request, res: Response) => {
  try {
    if (!req.identity) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const file = req.file as Express.Multer.File | undefined;

    let rawText: string;
    let pdfUrl: string | undefined;
    let previewImageUrl: string | undefined;
    let contentHash: string;

    // ─────────────────────────────
    // INPUT FLOW
    // ─────────────────────────────

    if (file?.buffer) {
      rawText = await extractTextFromPdf(file.buffer);
      contentHash = hash(file.buffer.toString("base64"));

      const cacheKey = cvHashKey(req.identity.id, contentHash);
      const cached = await getCache(cacheKey);

      if (cached) {
        return res.status(200).json({
          message: "CV already exists",
          cv: cached,
        });
      }

      const existing = await CVModel.findOne({
        ownerId: req.identity.id,
        contentHash,
      });

      if (existing) {
        await setCache(cacheKey, existing, 60 * 10);

        return res.status(200).json({
          message: "CV already exists",
          cv: existing,
        });
      }

      const upload = await uploadPDF(file.buffer, req.identity.id);

      pdfUrl = upload.secure_url;
      previewImageUrl = getPdfThumbnail(upload.public_id);
    } else if (req.body?.cvText?.trim()) {
      rawText = req.body.cvText.trim();
      contentHash = hash(rawText);

      const cacheKey = cvHashKey(req.identity.id, contentHash);
      const cached = await getCache(cacheKey);

      if (cached) {
        return res.status(200).json({
          message: "CV already exists",
          cv: cached,
        });
      }

      const existing = await CVModel.findOne({
        ownerId: req.identity.id,
        contentHash,
      });

      if (existing) {
        await setCache(cacheKey, existing, 60 * 10);

        return res.status(200).json({
          message: "CV already exists",
          cv: existing,
        });
      }
    } else {
      return res.status(400).json({
        error: "Provide a CV as PDF or text",
      });
    }

    // ─────────────────────────────
    // AI PROCESSING
    // ─────────────────────────────

    const parsedRaw = await extractCVData(rawText);
    const parsed = normalizeParsedCV(parsedRaw);

    // ─────────────────────────────
    // CREATE CV (race-safe with DB index)
    // ─────────────────────────────

    let createdCV;

    try {
      createdCV = await CVModel.create({
        ownerId: req.identity.id,
        ownerType: req.identity.type,
        rawText,
        parsed,
        pdfUrl,
        previewImageUrl,
        contentHash,
      });
    } catch (err: any) {
      // duplicate race condition fallback
      if (err.code === 11000) {
        const existing = await CVModel.findOne({
          ownerId: req.identity.id,
          contentHash,
        });

        return res.status(200).json({
          message: "CV already exists",
          cv: existing,
        });
      }

      throw err;
    }

    // ─────────────────────────────
    // CACHE + INVALIDATION
    // ─────────────────────────────

    const cacheKey = cvHashKey(req.identity.id, contentHash);

    await setCache(cacheKey, createdCV, 60 * 10);
    await deleteCache(cvListKey(req.identity.id, req.identity.type));

    // ─────────────────────────────
    // AUDIT
    // ─────────────────────────────

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
  } catch (err) {
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
      return res.status(401).json({ error: "Unauthorized" });
    }

    const key = cvListKey(req.identity.id, req.identity.type);

    const cached = await getCache(key);
    if (cached) return res.json(cached);

    const cvs = await CVModel.find({
      ownerId: req.identity.id,
      ownerType: req.identity.type,
    })
      .sort({ createdAt: -1 })
      .select("-rawText");

    await setCache(key, cvs, 60 * 10);

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
      return res.status(401).json({ error: "Unauthorized" });
    }

    const id = getParam(req.params.id);

    const cv = await CVModel.findOne({
      _id: id,
      ownerId: req.identity.id,
      ownerType: req.identity.type,
    });

    if (!cv) {
      return res.status(404).json({ error: "CV not found" });
    }

    return res.json(cv);
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
      return res.status(401).json({ error: "Unauthorized" });
    }

    const id = getParam(req.params.id);

    const deleted = await CVModel.findOneAndDelete({
      _id: id,
      ownerId: req.identity.id,
      ownerType: req.identity.type,
    });

    if (!deleted) {
      return res.status(404).json({ error: "CV not found" });
    }

    // cache invalidation
    await deleteCache(cvListKey(req.identity.id, req.identity.type));
    await deleteCache(cvHashKey(req.identity.id, deleted.contentHash));

    // audit
    await auditLog({
      event: "CV_DELETED",
      userId: req.identity.id,
      userType: req.identity.type,
      requestId: req.requestId,
      ip: req.ip,
      resourceId: id,
      metadata: { cvId: id },
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
