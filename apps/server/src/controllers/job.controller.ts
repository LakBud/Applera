import { extractTextFromPdf } from '../lib/pdfParser.js';
import { getAbortSignal } from '../middleware/timeout.middleware.js';
import Job from '../models/Job.js';
import { auditLog } from '../services/audit/audit.service.js';
import { extractJobData } from '../services/extractors.service.js';
import { getParam } from '../utils/shared/param.utils.js';
import { normalizeString } from '../utils/shared/repair.utils.js';

import type { Request, Response } from 'express';

type UploadedFile = Express.Multer.File;

// ─────────────────────────────────────────────
// POST /api/job (CREATE JOB)
// ─────────────────────────────────────────────

export const createJob = async (req: Request, res: Response) => {
  const signal = getAbortSignal(res);

  try {
    const identity = req.identity;

    if (!identity) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    signal.throwIfAborted();

    let rawText: string;
    const file = req.file as UploadedFile | undefined;

    if (file?.buffer) {
      rawText = await extractTextFromPdf(file.buffer, { signal });
    } else if (req.body?.jobText?.trim()) {
      rawText = normalizeString(req.body.jobText);
    } else {
      return res.status(400).json({
        error: 'Provide a job listing as PDF or text',
      });
    }

    signal.throwIfAborted();

    const parsed = await extractJobData(rawText, {
      signal,
      reserveUsage: req.reserveUsage,
      refundUsage: req.refundUsage,
    });

    signal.throwIfAborted();

    const createdJob = await Job.create({
      ownerId: identity.id,
      ownerType: identity.type,
      rawText,
      parsed,
    });

    signal.throwIfAborted();

    await auditLog({
      event: 'JOB_CREATED',
      userId: identity.id,
      userType: identity.type,
      requestId: req.requestId,
      ip: req.ip,
      resourceId: String(createdJob._id),
      metadata: {
        title: parsed.title,
        seniority: parsed.seniority,
      },
    });

    return res.status(201).json({
      message: 'Job created successfully',
      job: createdJob,
    });
  } catch (err) {
    if (signal.aborted || (err instanceof Error && err.name === 'AbortError')) {
      console.warn('[createJob] aborted (timeout or disconnect)', {
        requestId: req.requestId,
      });
      return;
    }

    throw err;
  }
};

// ─────────────────────────────────────────────
// GET /api/job
// ─────────────────────────────────────────────

export const getJobs = async (req: Request, res: Response) => {
  const identity = req.identity;

  if (!identity) {
    return res.status(401).json({
      error: 'Unauthorized',
    });
  }

  const jobs = await Job.find({
    ownerId: identity.id,
    ownerType: identity.type,
  })
    .sort({ createdAt: -1 })
    .select('-rawText');

  return res.json(jobs);
};

// ─────────────────────────────────────────────
// GET /api/job/:id
// ─────────────────────────────────────────────

export const getJobById = async (req: Request, res: Response) => {
  const identity = req.identity;

  if (!identity) {
    return res.status(401).json({
      error: 'Unauthorized',
    });
  }

  const id = getParam(req.params.id);

  const job = await Job.findOne({
    _id: id,
    ownerId: identity.id,
    ownerType: identity.type,
  });

  if (!job) {
    return res.status(404).json({
      error: 'Job not found',
    });
  }

  return res.json(job);
};

// ─────────────────────────────────────────────
// DELETE /api/job/:id
// ─────────────────────────────────────────────

export const deleteJob = async (req: Request, res: Response) => {
  const identity = req.identity;

  if (!identity) {
    return res.status(401).json({
      error: 'Unauthorized',
    });
  }

  const id = getParam(req.params.id);

  const deleted = await Job.findOneAndDelete({
    _id: id,
    ownerId: identity.id,
    ownerType: identity.type,
  });

  if (!deleted) {
    return res.status(404).json({
      error: 'Job not found',
    });
  }

  await auditLog({
    event: 'JOB_DELETED',
    userId: identity.id,
    userType: identity.type,
    requestId: req.requestId,
    ip: req.ip,
    resourceId: id,
  });

  return res.json({
    message: 'Job deleted successfully',
  });
};
