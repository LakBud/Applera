import axios from 'axios';

import { cloudinary } from '../config/cloudinary.js';
import { deleteCache, getCache, setCache } from '../lib/cache.js';
import { uploadImage } from '../lib/cloudinary/cloudinary.upload.js';
import { extractTextFromPdf } from '../lib/pdfParser.js';
import { getAbortSignal } from '../middleware/timeout.middleware.js';
import Application from '../models/Application.js';
import CVModel from '../models/CV.js';
import { auditLog } from '../services/audit/audit.service.js';
import { extractCVData } from '../services/extractors.service.js';
import { LLMError } from '../services/llm/llm.service.js';
import { normalizeParsedCV } from '../utils/cv/cv.normalize.utils.js';
import { hash } from '../utils/shared/hash.utils.js';
import { getParam } from '../utils/shared/param.utils.js';

import type { Request, Response } from 'express';

const cvHashKey = (userId: string, hash: string) => `cv:hash:${userId}:${hash}`;
const cvListKey = (userId: string, type: string) => `cvs:${userId}:${type}`;

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

async function findExistingCV(ownerId: string, contentHash: string) {
  const cacheKey = cvHashKey(ownerId, contentHash);

  const cached = await getCache(cacheKey);
  if (cached) {
    return cached;
  }

  const existing = await CVModel.findOne({ ownerId, contentHash });
  if (existing) {
    await setCache(cacheKey, existing, 60 * 10);
    return existing;
  }

  return null;
}

function isMongoError(err: unknown): err is { code: number } {
  return typeof err === 'object' && err !== null && 'code' in err;
}

const pipeStreamOrFail = (
  stream: NodeJS.ReadableStream,
  res: Response,
  logLabel: string,
  errorMessage: string,
) => {
  stream.on('error', (err: unknown) => {
    console.error(`[${logLabel} stream]`, err);

    if (!res.headersSent) {
      res.status(500).json({
        error: errorMessage,
      });
    } else {
      res.destroy();
    }
  });

  stream.pipe(res);
};

// ─────────────────────────────────────────────
// POST /api/cv
// ─────────────────────────────────────────────

export const createCV = async (req: Request, res: Response) => {
  const signal = getAbortSignal(res);

  try {
    if (!req.identity) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    signal.throwIfAborted();

    const file = req.file as Express.Multer.File | undefined;

    let rawText: string;
    let pdfUrl: string | undefined;
    let contentHash: string;
    let cloudinaryPublicId: string | undefined;

    // ─────────────────────────────
    // INPUT FLOW
    // ─────────────────────────────

    if (file?.buffer) {
      rawText = await extractTextFromPdf(file.buffer, { signal });

      signal.throwIfAborted();

      contentHash = hash(file.buffer.toString('base64'));

      const existing = await findExistingCV(req.identity.id, contentHash);

      if (existing) {
        return res.status(200).json({
          message: 'CV already exists',
          cv: existing,
        });
      }

      signal.throwIfAborted();

      const upload = await uploadImage(file.buffer, req.identity.id);

      cloudinaryPublicId = upload.public_id;
      pdfUrl = upload.secure_url;
    } else if (req.body?.cvText?.trim()) {
      rawText = req.body.cvText.trim();

      signal.throwIfAborted();

      contentHash = hash(rawText);

      const existing = await findExistingCV(req.identity.id, contentHash);

      if (existing) {
        return res.status(200).json({
          message: 'CV already exists',
          cv: existing,
        });
      }
    } else {
      return res.status(400).json({
        error: 'Provide a CV as PDF or text',
      });
    }

    // ─────────────────────────────
    // AI PROCESSING
    // ─────────────────────────────

    signal.throwIfAborted();

    const parsedRaw = await extractCVData(rawText, {
      signal,
      reserveUsage: req.reserveUsage,
      refundUsage: req.refundUsage,
    });

    signal.throwIfAborted();

    const parsed = normalizeParsedCV(parsedRaw);

    // ─────────────────────────────
    // CREATE CV (race-safe with DB index)
    // ─────────────────────────────

    let createdCV;

    try {
      signal.throwIfAborted();

      createdCV = await CVModel.create({
        ownerId: req.identity.id,
        ownerType: req.identity.type,
        rawText,
        parsed,
        pdfUrl,
        cloudinaryPublicId,
        contentHash,
      });
    } catch (err) {
      if (isMongoError(err) && err.code === 11000) {
        const existing = await CVModel.findOne({
          ownerId: req.identity.id,
          contentHash,
        });

        return res.status(200).json({
          message: 'CV already exists',
          cv: existing,
        });
      }

      throw err;
    }

    // ─────────────────────────────
    // CACHE + INVALIDATION
    // ─────────────────────────────

    signal.throwIfAborted();

    const cacheKey = cvHashKey(req.identity.id, contentHash);

    await setCache(cacheKey, createdCV, 60 * 10);
    await deleteCache(cvListKey(req.identity.id, req.identity.type));

    // ─────────────────────────────
    // AUDIT
    // ─────────────────────────────

    await auditLog({
      event: 'CV_CREATED',
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
      message: 'CV created successfully',
      cv: createdCV,
    });
  } catch (err) {
    if (
      signal.aborted ||
      (err instanceof Error && err.name === 'AbortError') ||
      (err instanceof LLMError && err.type === 'aborted')
    ) {
      console.warn('[createCV] aborted (timeout or disconnect)', {
        requestId: req.requestId,
      });

      return;
    }

    throw err;
  }
};

// ─────────────────────────────────────────────
// GET /api/cv
// ─────────────────────────────────────────────

export const getCVs = async (req: Request, res: Response) => {
  if (!req.identity) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const key = cvListKey(req.identity.id, req.identity.type);

  const cached = await getCache(key);
  if (cached) {
    return res.json(cached);
  }

  const cvs = await CVModel.find({
    ownerId: req.identity.id,
    ownerType: req.identity.type,
  })
    .sort({ pinned: -1, createdAt: -1 })
    .select('-rawText')
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
        _id: '$cv',
        count: { $sum: 1 },
      },
    },
  ]);

  const countMap = new Map(counts.map((c) => [c._id.toString(), c.count]));

  const enriched = cvs.map((cv) => ({
    ...cv,
    applicationsCount: countMap.get(cv._id.toString()) ?? 0,
    previewUrl: cv.cloudinaryPublicId ? `/api/cv/${cv._id}/preview` : null,
  }));

  await setCache(key, enriched, 60 * 10);

  return res.json(enriched);
};

// ─────────────────────────────────────────────
// GET /api/cv/:id
// ─────────────────────────────────────────────

export const getCVById = async (req: Request, res: Response) => {
  if (!req.identity) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const id = getParam(req.params.id);

  const cv = await CVModel.findOne({
    _id: id,
    ownerId: req.identity.id,
    ownerType: req.identity.type,
  }).lean();

  if (!cv) {
    return res.status(404).json({ error: 'CV not found' });
  }

  const applicationsCount = await Application.countDocuments({
    cv: cv._id,
    ownerId: req.identity.id,
    ownerType: req.identity.type,
  });

  const previewUrl = cv.cloudinaryPublicId ? `/api/cv/${cv._id}/preview` : null;

  return res.json({
    ...cv,
    applicationsCount,
    previewUrl,
  });
};

// ─────────────────────────────────────────────
// DELETE /api/cv/:id
// ─────────────────────────────────────────────

export const deleteCV = async (req: Request, res: Response) => {
  if (!req.identity) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const id = getParam(req.params.id);

  const deleted = await CVModel.findOneAndDelete({
    _id: id,
    ownerId: req.identity.id,
    ownerType: req.identity.type,
  });

  if (!deleted) {
    return res.status(404).json({ error: 'CV not found' });
  }

  if (deleted.cloudinaryPublicId) {
    await cloudinary.uploader.destroy(deleted.cloudinaryPublicId, { resource_type: 'image' });
  }

  await deleteCache(cvListKey(req.identity.id, req.identity.type));
  await deleteCache(cvHashKey(req.identity.id, deleted.contentHash));

  await auditLog({
    event: 'CV_DELETED',
    userId: req.identity.id,
    userType: req.identity.type,
    requestId: req.requestId,
    ip: req.ip,
    resourceId: id,
    metadata: { cvId: id },
  });

  return res.json({ message: 'CV deleted successfully' });
};

// ─────────────────────────────────────────────
// PATCH /api/cv/:id/pin
// ─────────────────────────────────────────────

export const pinCV = async (req: Request, res: Response) => {
  if (!req.identity) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id: ownerId, type: ownerType } = req.identity;
  const id = getParam(req.params.id);

  const cv = await CVModel.findOne({ _id: id, ownerId, ownerType });

  if (!cv) {
    return res.status(404).json({ error: 'CV not found' });
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
      error: 'You can only pin up to 5 CVs. Unpin one first.',
    });
  }

  cv.pinned = true;
  await cv.save();
  await deleteCache(cvListKey(ownerId, ownerType));

  await auditLog({
    event: 'CV_PINNED',
    userId: ownerId,
    userType: ownerType,
    resourceId: id,
    requestId: req.requestId,
    ip: req.ip,
  });

  return res.json({ cv, pinned: true });
};

// GET /api/cv/:id/preview
export const getCVPreview = async (req: Request, res: Response) => {
  if (!req.identity) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const id = getParam(req.params.id);

  const cv = await CVModel.findOne({
    _id: id,
    ownerId: req.identity.id,
    ownerType: req.identity.type,
  });

  if (!cv || !cv.cloudinaryPublicId) {
    return res.status(404).json({ error: 'Not found' });
  }

  const url = cloudinary.url(cv.cloudinaryPublicId, {
    resource_type: 'image',
    secure: true,
    format: 'jpg',
    sign_url: true,
    type: 'authenticated',
  });

  const response = await axios.get(url, { responseType: 'stream', timeout: 10_000 });

  res.setHeader('Content-Type', 'image/jpeg');
  res.setHeader('Cache-Control', 'private, max-age=3600'); // browser caches for 1hr
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');

  pipeStreamOrFail(response.data, res, 'getCVPreview', 'Failed to stream preview');

  response.data.pipe(res);
};

// GET /api/cv/:id/pdf
export const getCVPdf = async (req: Request, res: Response) => {
  if (!req.identity) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const id = getParam(req.params.id);

  const cv = await CVModel.findOne({
    _id: id,
    ownerId: req.identity.id,
    ownerType: req.identity.type,
  });

  if (!cv || !cv.cloudinaryPublicId) {
    return res.status(404).json({ error: 'Not found' });
  }

  const url = cloudinary.url(cv.cloudinaryPublicId, {
    resource_type: 'image',
    secure: true,
    sign_url: true,
    type: 'authenticated',
    expires_at: Math.floor(Date.now() / 1000) + 60 * 60,
  });

  const response = await axios.get(url, { responseType: 'stream', timeout: 10_000 });

  const allowedHeaders = ['content-type', 'content-length'];
  Object.keys(response.headers).forEach((key) => {
    if (allowedHeaders.includes(key.toLowerCase())) {
      res.setHeader(key, response.headers[key]);
    }
  });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'inline');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');

  pipeStreamOrFail(response.data, res, 'getCVPdf', 'Failed to stream PDF');

  response.data.pipe(res);
};
