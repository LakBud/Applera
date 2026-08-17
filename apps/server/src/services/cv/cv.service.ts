import mongoose from 'mongoose';

import { cloudinary } from '../../config/cloudinary.js';
import { deleteCache, getCache, setCache } from '../../lib/cache.js';
import { uploadImage } from '../../lib/cloudinary/cloudinary.upload.js';
import { extractTextFromPdf } from '../../lib/pdfParser.js';
import Application from '../../models/Application.js';
import CVModel from '../../models/CV.js';
import User from '../../models/User.js';
import { normalizeParsedCV } from '../../utils/cv/cv.normalize.utils.js';
import { BadRequestError } from '../../utils/errors/badRequest.error.js';
import { ExternalServiceError } from '../../utils/errors/externalService.error.js';
import { NotFoundError } from '../../utils/errors/notFound.error.js';
import { hash } from '../../utils/shared/hash.utils.js';
import { extractCVData } from '../extractors.service.js';
import { cvHashKey, cvListKey, findExistingCV, isMongoError } from './cv.helpers.service.js';

import type { LLMExecutionOptions } from '../../types/llm.types.js';
import type { Identity } from '../../types/schemas/identity.schemas.js';

export type CreateCVInput = { source: 'pdf'; buffer: Buffer } | { source: 'text'; text: string };

// Service for POST /api/cv
export async function createCV(
  identity: Identity,
  input: CreateCVInput,
  { signal, reserveUsage, refundUsage }: LLMExecutionOptions = {},
) {
  signal?.throwIfAborted();

  let rawText: string;
  let pdfUrl: string | undefined;
  let contentHash: string;
  let cloudinaryPublicId: string | undefined;

  // ─────────────────────────────
  // INPUT FLOW
  // ─────────────────────────────

  if (input.source === 'pdf') {
    rawText = await extractTextFromPdf(input.buffer, { signal });

    signal?.throwIfAborted();

    contentHash = hash(input.buffer.toString('base64'));

    const existing = await findExistingCV(identity.id, contentHash);
    if (existing) {
      return { cv: existing, alreadyExists: true as const };
    }

    signal?.throwIfAborted();

    const upload = await uploadImage(input.buffer, identity.id);

    cloudinaryPublicId = upload.public_id;
    pdfUrl = upload.secure_url;
  } else {
    rawText = input.text;

    signal?.throwIfAborted();

    contentHash = hash(rawText);

    const existing = await findExistingCV(identity.id, contentHash);
    if (existing) {
      return { cv: existing, alreadyExists: true as const };
    }
  }

  // ─────────────────────────────
  // AI PROCESSING
  // ─────────────────────────────

  signal?.throwIfAborted();

  const parsedRaw = await extractCVData(rawText, { signal, reserveUsage, refundUsage });

  signal?.throwIfAborted();

  const parsed = normalizeParsedCV(parsedRaw);

  // ─────────────────────────────
  // CREATE CV (race-safe with DB index)
  // ─────────────────────────────

  let createdCV;

  try {
    signal?.throwIfAborted();

    createdCV = await CVModel.create({
      ownerId: identity.id,
      ownerType: identity.type,
      rawText,
      parsed,
      pdfUrl,
      cloudinaryPublicId,
      contentHash,
    });
  } catch (err) {
    if (isMongoError(err) && err.code === 11000) {
      const existing = await CVModel.findOne({ ownerId: identity.id, contentHash });
      return { cv: existing, alreadyExists: true as const };
    }

    throw err;
  }

  // ─────────────────────────────
  // CACHE + INVALIDATION
  // ─────────────────────────────

  signal?.throwIfAborted();

  const cacheKey = cvHashKey(identity.id, contentHash);

  await setCache(cacheKey, createdCV, 60 * 10);
  await deleteCache(cvListKey(identity.id, identity.type));

  return { cv: createdCV, alreadyExists: false as const };
}

// Service for GET /api/cv
export async function getCVs(identity: Identity) {
  const key = cvListKey(identity.id, identity.type);

  const cached = await getCache(key);
  if (cached) {
    return cached;
  }

  const cvs = await CVModel.find({
    ownerId: identity.id,
    ownerType: identity.type,
  })
    .sort({ pinned: -1, createdAt: -1 })
    .select('-rawText')
    .lean();

  const cvIds = cvs.map((cv) => cv._id);

  const counts = await Application.aggregate([
    {
      $match: {
        ownerId: identity.id,
        ownerType: identity.type,
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

  return enriched;
}

// Service for GET /api/cv/:id
export async function getCVById(id: string, identity: Identity) {
  const cv = await CVModel.findOne({
    _id: id,
    ownerId: identity.id,
    ownerType: identity.type,
  }).lean();

  if (!cv) {
    throw new NotFoundError('CV not found');
  }

  const applicationsCount = await Application.countDocuments({
    cv: cv._id,
    ownerId: identity.id,
    ownerType: identity.type,
  });

  const previewUrl = cv.cloudinaryPublicId ? `/api/cv/${cv._id}/preview` : null;

  return { ...cv, applicationsCount, previewUrl };
}

// Service for DELETE /api/cv/:id
export async function deleteCV(id: string, identity: Identity) {
  const { id: ownerId, type: ownerType } = identity;

  const deleted = await CVModel.findOneAndDelete({
    _id: id,
    ownerId,
    ownerType,
    pinned: false,
  });

  if (!deleted) {
    const exists = await CVModel.exists({ _id: id, ownerId, ownerType });
    throw exists
      ? new BadRequestError('Unpin this CV before deleting it')
      : new NotFoundError('CV not found');
  }

  if (deleted.cloudinaryPublicId) {
    try {
      await cloudinary.uploader.destroy(deleted.cloudinaryPublicId, { resource_type: 'image' });
    } catch {
      throw new ExternalServiceError(`Failed to upload CV. Please try again.`);
    }
  }

  await deleteCache(cvListKey(ownerId, ownerType));
  await deleteCache(cvHashKey(ownerId, deleted.contentHash));

  return deleted;
}

// Service for PATCH /api/cv/:id/pin
export async function pinCV(id: string, identity: Identity) {
  const { id: ownerId, type: ownerType } = identity;

  const session = await mongoose.startSession();

  try {
    const response = await session.withTransaction(async () => {
      const cv = await CVModel.findOne({
        _id: id,
        ownerId,
        ownerType,
      }).session(session);

      if (!cv) {
        throw new NotFoundError('CV not found');
      }

      const user = await User.findOne({ clerkId: ownerId }).session(session);

      if (!user) {
        throw new NotFoundError('User not found');
      }

      const actualPinnedCount = await CVModel.countDocuments({
        ownerId,
        ownerType,
        pinned: true,
      }).session(session);

      // Unpin
      if (cv.pinned) {
        cv.pinned = false;
        await cv.save({ session });

        await User.updateOne(
          { clerkId: ownerId },
          {
            $set: {
              pinnedCVCount: Math.max(actualPinnedCount - 1, 0),
            },
          },
          { session },
        );

        return { cv, pinned: false as const };
      }

      // Pin limit
      if (actualPinnedCount >= 5) {
        throw new BadRequestError('You can only pin up to 5 CVs. Unpin one first.');
      }

      cv.pinned = true;
      await cv.save({ session });

      await User.updateOne(
        { clerkId: ownerId },
        {
          $set: {
            pinnedCVCount: actualPinnedCount + 1,
          },
        },
        { session },
      );

      return { cv, pinned: true as const };
    });

    await deleteCache(cvListKey(ownerId, ownerType));

    return response;
  } finally {
    await session.endSession();
  }
}

// Shared lookup for GET /api/cv/:id/preview and GET /api/cv/:id/pdf. both need the CV's
// cloudinaryPublicId under the requesting identity's ownership; each route builds its own
// signed URL shape (jpg preview vs authenticated pdf) and streams the response itself.
export async function getCVCloudinaryPublicId(id: string, identity: Identity) {
  const cv = await CVModel.findOne({
    _id: id,
    ownerId: identity.id,
    ownerType: identity.type,
  });

  if (!cv || !cv.cloudinaryPublicId) {
    throw new NotFoundError('Image not found');
  }

  return cv.cloudinaryPublicId;
}
