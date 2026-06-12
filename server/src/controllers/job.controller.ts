import { Response, Request } from 'express';

import Job from '../models/Job.js';
import { extractTextFromPdf } from '../lib/pdfParser.js';
import { extractJobData } from '../services/extractors.service.js';
import { auditLog } from '../middleware/log/audit.logger.js';

import { getParam } from '../utils/req.js';

type UploadedFile = Express.Multer.File;

// ─────────────────────────────────────────────
// POST /api/job (CREATE JOB)
// ─────────────────────────────────────────────

export const createJob = async (req: Request, res: Response) => {
  try {
    const identity = req.identity;

    if (!identity) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    let rawText: string;
    const file = req.file as UploadedFile | undefined;

    if (file?.buffer) {
      rawText = await extractTextFromPdf(file.buffer);
    } else if (req.body?.jobText?.trim()) {
      rawText = req.body.jobText.trim();
    } else {
      return res.status(400).json({
        error: 'Provide a job listing as PDF or text',
      });
    }

    const parsed = await extractJobData(rawText);

    const createdJob = await Job.create({
      ownerId: identity.id,
      ownerType: identity.type,
      rawText,
      parsed,
    });

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
    console.error('[createJob]', err);
    return res.status(500).json({
      error: 'Failed to create job',
    });
  }
};

// ─────────────────────────────────────────────
// GET /api/job
// ─────────────────────────────────────────────

export const getJobs = async (req: Request, res: Response) => {
  try {
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
  } catch (err) {
    console.error('[getJobs]', err);
    return res.status(500).json({
      error: 'Failed to fetch jobs',
    });
  }
};

// ─────────────────────────────────────────────
// GET /api/job/:id
// ─────────────────────────────────────────────

export const getJobById = async (req: Request, res: Response) => {
  try {
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
  } catch (err) {
    console.error('[getJobById]', err);
    return res.status(500).json({
      error: 'Failed to fetch job',
    });
  }
};

// ─────────────────────────────────────────────
// DELETE /api/job/:id
// ─────────────────────────────────────────────

export const deleteJob = async (req: Request, res: Response) => {
  try {
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
  } catch (err) {
    console.error('[deleteJob]', err);
    return res.status(500).json({
      error: 'Failed to delete job',
    });
  }
};

// ─────────────────────────────────────────────
// POST /api/job/parse
// optional parse-only endpoint
// ─────────────────────────────────────────────

export const parseJob = async (req: Request, res: Response) => {
  try {
    const identity = req.identity;

    if (!identity) {
      return res.status(401).json({
        error: 'Unauthorized',
      });
    }

    let rawText: string;
    const file = req.file as UploadedFile | undefined;

    if (file?.buffer) {
      rawText = await extractTextFromPdf(file.buffer);
    } else if (req.body?.jobText?.trim()) {
      rawText = req.body.jobText.trim();
    } else {
      return res.status(400).json({
        error: 'Provide a job listing as PDF or text',
      });
    }

    const parsed = await extractJobData(rawText);

    return res.json({
      rawText,
      parsed,
    });
  } catch (err) {
    console.error('[parseJob]', err);
    return res.status(500).json({
      error: 'Failed to parse job',
    });
  }
};
