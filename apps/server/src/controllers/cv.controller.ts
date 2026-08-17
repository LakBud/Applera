import axios from 'axios';
import { isLLMError } from 'vern-llm';

import { cloudinary } from '../config/cloudinary.js';
import { getAbortSignal } from '../middleware/timeout.middleware.js';
import { auditLog } from '../services/audit/audit.service.js';
import {
  createCV as createCVService,
  deleteCV as deleteCVService,
  getCVById as getCVByIdService,
  getCVCloudinaryPublicId,
  getCVs as getCVsService,
  pinCV as pinCVService,
  type CreateCVInput,
} from '../services/cv/cv.service.js';
import { BadRequestError } from '../utils/errors/badRequest.error.js';
import { getParam } from '../utils/shared/param.utils.js';

import type { UserRequest } from '../types/requests.js';
import type { Response } from 'express';

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

export const createCV = async (req: UserRequest, res: Response) => {
  const signal = getAbortSignal(res);

  try {
    signal.throwIfAborted();

    const file = req.file as Express.Multer.File | undefined;

    let input: CreateCVInput;

    if (file?.buffer) {
      input = { source: 'pdf', buffer: file.buffer };
    } else if (req.body?.cvText?.trim()) {
      input = { source: 'text', text: req.body.cvText.trim() };
    } else {
      throw new BadRequestError('Provide a CV as PDF or text');
    }

    const { cv, alreadyExists } = await createCVService(req.identity, input, {
      signal,
      reserveUsage: req.reserveUsage,
      refundUsage: req.refundUsage,
    });

    if (alreadyExists) {
      return res.status(200).json({
        message: 'CV already exists',
        cv,
      });
    }

    await auditLog({
      event: 'CV_CREATED',
      userId: req.identity.id,
      userType: req.identity.type,
      requestId: req.requestId,
      ip: req.ip,
      resourceId: String(cv._id),
      metadata: {
        cvId: String(cv._id),
      },
    });

    return res.status(201).json({
      message: 'CV created successfully',
      cv,
    });
  } catch (err) {
    if (
      signal.aborted ||
      (err instanceof Error && err.name === 'AbortError') ||
      (isLLMError(err) && err.type === 'aborted')
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

export const getCVs = async (req: UserRequest, res: Response) => {
  const cvs = await getCVsService(req.identity);
  return res.json(cvs);
};

// ─────────────────────────────────────────────
// GET /api/cv/:id
// ─────────────────────────────────────────────

export const getCVById = async (req: UserRequest, res: Response) => {
  const id = getParam(req.params.id);
  const cv = await getCVByIdService(id, req.identity);
  return res.json(cv);
};

// ─────────────────────────────────────────────
// DELETE /api/cv/:id
// ─────────────────────────────────────────────

export const deleteCV = async (req: UserRequest, res: Response) => {
  const id = getParam(req.params.id);
  const { id: ownerId, type: ownerType } = req.identity;

  await deleteCVService(id, req.identity);

  await auditLog({
    event: 'CV_DELETED',
    userId: ownerId,
    userType: ownerType,
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

export const pinCV = async (req: UserRequest, res: Response) => {
  const { id: ownerId, type: ownerType } = req.identity;
  const id = getParam(req.params.id);

  const response = await pinCVService(id, req.identity);

  if (response.pinned) {
    await auditLog({
      event: 'CV_PINNED',
      userId: ownerId,
      userType: ownerType,
      resourceId: id,
      requestId: req.requestId,
      ip: req.ip,
    });
  }

  return res.json(response);
};

// GET /api/cv/:id/preview
export const getCVPreview = async (req: UserRequest, res: Response) => {
  const id = getParam(req.params.id);

  const cloudinaryPublicId = await getCVCloudinaryPublicId(id, req.identity);

  const url = cloudinary.url(cloudinaryPublicId, {
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
};

// GET /api/cv/:id/pdf
export const getCVPdf = async (req: UserRequest, res: Response) => {
  const id = getParam(req.params.id);

  const cloudinaryPublicId = await getCVCloudinaryPublicId(id, req.identity);

  const url = cloudinary.url(cloudinaryPublicId, {
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
};
