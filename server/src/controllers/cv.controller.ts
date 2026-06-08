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
import Application from "../models/Application.js";
import { cloudinary } from "../config/cloudinary.js";
import axios from "axios";

const cvHashKey = (userId: string, hash: string) => `cv:hash:${userId}:${hash}`;
const cvListKey = (userId: string, type: string) => `cvs:${userId}:${type}`;

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

async function findExistingCV(ownerId: string, contentHash: string) {
  const cacheKey = cvHashKey(ownerId, contentHash);

  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const existing = await CVModel.findOne({ ownerId, contentHash });
  if (existing) {
    await setCache(cacheKey, existing, 60 * 10);
    return existing;
  }

  return null;
}

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
    let contentHash: string;
    let cloudinaryPublicId: string | undefined;

    // ─────────────────────────────
    // INPUT FLOW
    // ─────────────────────────────

    if (file?.buffer) {
      rawText = await extractTextFromPdf(file.buffer);
      contentHash = hash(file.buffer.toString("base64"));

      const existing = await findExistingCV(req.identity.id, contentHash);
      if (existing) {
        return res.status(200).json({ message: "CV already exists", cv: existing });
      }

      const upload = await uploadPDF(file.buffer, req.identity.id);
      cloudinaryPublicId = upload.public_id;
    } else if (req.body?.cvText?.trim()) {
      rawText = req.body.cvText.trim();
      contentHash = hash(rawText);

      const existing = await findExistingCV(req.identity.id, contentHash);
      if (existing) {
        return res.status(200).json({ message: "CV already exists", cv: existing });
      }
    } else {
      return res.status(400).json({ error: "Provide a CV as PDF or text" });
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
        cloudinaryPublicId,
        contentHash,
      });
    } catch (err: any) {
      if (err.code === 11000) {
        const existing = await CVModel.findOne({
          ownerId: req.identity.id,
          contentHash,
        });
        return res.status(200).json({ message: "CV already exists", cv: existing });
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
      metadata: { cvId: String(createdCV._id) },
    });

    return res.status(201).json({ message: "CV created successfully", cv: createdCV });
  } catch (err) {
    console.error("[createCV]", err);
    return res.status(500).json({ error: "Failed to create CV" });
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
      .sort({ pinned: -1, createdAt: -1 })
      .select("-rawText")
      .lean();

    const cvIds = cvs.map((cv) => cv._id);

    const counts = await Application.aggregate([
      {
        $match: {
          ownerId: req.identity.id,
          ownerType: req.identity.type,
          cv: { $in: cvIds },
        },
      },
      {
        $group: {
          _id: "$cv",
          count: { $sum: 1 },
        },
      },
    ]);

    const countMap = new Map(counts.map((c) => [c._id.toString(), c.count]));

    const enriched = cvs.map((cv) => ({
      ...cv,
      applicationsCount: countMap.get(cv._id.toString()) ?? 0,
      previewUrl: cv.cloudinaryPublicId
        ? cloudinary.url(cv.cloudinaryPublicId, {
            resource_type: "image",
            secure: true,
            format: "jpg",
          })
        : null,
    }));

    await setCache(key, enriched, 60 * 10);

    return res.json(enriched);
  } catch (err) {
    console.error("[getCVs]", err);
    return res.status(500).json({ error: "Failed to fetch CVs" });
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
    }).lean();

    if (!cv) {
      return res.status(404).json({ error: "CV not found" });
    }

    const applicationsCount = await Application.countDocuments({
      cv: cv._id,
      ownerId: req.identity.id,
      ownerType: req.identity.type,
    });

    return res.json({ ...cv, applicationsCount });
  } catch (err) {
    console.error("[getCVById]", err);
    return res.status(500).json({ error: "Failed to fetch CV" });
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

    await deleteCache(cvListKey(req.identity.id, req.identity.type));
    await deleteCache(cvHashKey(req.identity.id, deleted.contentHash));

    await auditLog({
      event: "CV_DELETED",
      userId: req.identity.id,
      userType: req.identity.type,
      requestId: req.requestId,
      ip: req.ip,
      resourceId: id,
      metadata: { cvId: id },
    });

    return res.json({ message: "CV deleted successfully" });
  } catch (err) {
    console.error("[deleteCV]", err);
    return res.status(500).json({ error: "Failed to delete CV" });
  }
};

// ─────────────────────────────────────────────
// PATCH /api/cv/:id/pin
// ─────────────────────────────────────────────

export const pinCV = async (req: Request, res: Response) => {
  try {
    if (!req.identity) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { id: ownerId, type: ownerType } = req.identity;
    const id = getParam(req.params.id);

    const cv = await CVModel.findOne({ _id: id, ownerId, ownerType });

    if (!cv) {
      return res.status(404).json({ error: "CV not found" });
    }

    // Unpin
    if (cv.pinned) {
      cv.pinned = false;
      await cv.save();
      await deleteCache(cvListKey(ownerId, ownerType));
      return res.json({ cv, pinned: false });
    }

    // Enforce max 5 pinned
    const pinnedCount = await CVModel.countDocuments({ ownerId, ownerType, pinned: true });
    if (pinnedCount >= 5) {
      return res.status(400).json({
        error: "You can only pin up to 5 CVs. Unpin one first.",
      });
    }

    cv.pinned = true;
    await cv.save();
    await deleteCache(cvListKey(ownerId, ownerType));

    await auditLog({
      event: "CV_PINNED",
      userId: ownerId,
      userType: ownerType,
      resourceId: id,
      requestId: req.requestId,
      ip: req.ip,
    });

    return res.json({ cv, pinned: true });
  } catch (err) {
    console.error("[pinCV]", err);
    return res.status(500).json({ error: "Failed to pin CV" });
  }
};

// GET /api/cv/:id/pdf
export const getCVPdf = async (req: Request, res: Response) => {
  try {
    if (!req.identity) return res.status(401).json({ error: "Unauthorized" });

    const cv = await CVModel.findOne({
      _id: req.params.id,
      ownerId: req.identity.id,
      ownerType: req.identity.type,
    });

    if (!cv || !cv.cloudinaryPublicId) return res.status(404).json({ error: "Not found" });

    const url = cloudinary.url(cv.cloudinaryPublicId, {
      resource_type: "image",
      secure: true,
    });

    const response = await axios.get(url, { responseType: "stream" });

    const allowedHeaders = ["content-type", "content-length"];
    Object.keys(response.headers).forEach((key) => {
      if (allowedHeaders.includes(key.toLowerCase())) {
        res.setHeader(key, response.headers[key]);
      }
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline");
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    response.data.pipe(res);
  } catch (err) {
    console.error("[getCVPdf]", err);
    res.status(500).json({ error: "Failed to fetch PDF" });
  }
};
