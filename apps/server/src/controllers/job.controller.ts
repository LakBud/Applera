import { getAbortSignal } from '../middleware/timeout.middleware.js';
import { auditLog } from '../services/audit/audit.service.js';
import {
  createJob as createJobService,
  deleteJob as deleteJobService,
  getJobById as getJobByIdService,
  getJobs as getJobsService,
  type CreateJobInput,
} from '../services/job/job.service.js';
import { BadRequestError } from '../utils/errors/badRequest.error.js';
import { getParam } from '../utils/shared/param.utils.js';

import type { UserRequest } from '../types/requests.js';
import type { Response } from 'express';

type UploadedFile = Express.Multer.File;

// ─────────────────────────────────────────────
// POST /api/job (CREATE JOB)
// ─────────────────────────────────────────────

export const createJob = async (req: UserRequest, res: Response) => {
  const signal = getAbortSignal(res);

  try {
    const identity = req.identity;

    signal.throwIfAborted();

    const file = req.file as UploadedFile | undefined;

    let input: CreateJobInput;

    if (file?.buffer) {
      input = { source: 'pdf', buffer: file.buffer };
    } else if (req.body?.jobText?.trim()) {
      input = { source: 'text', text: req.body.jobText };
    } else {
      throw new BadRequestError('Provide a job listing as PDF or text');
    }

    const createdJob = await createJobService(identity, input, {
      signal,
      reserveUsage: req.reserveUsage,
      refundUsage: req.refundUsage,
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
        title: createdJob.parsed?.title,
        seniority: createdJob.parsed?.seniority,
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

export const getJobs = async (req: UserRequest, res: Response) => {
  const jobs = await getJobsService(req.identity);
  return res.json(jobs);
};

// ─────────────────────────────────────────────
// GET /api/job/:id
// ─────────────────────────────────────────────

export const getJobById = async (req: UserRequest, res: Response) => {
  const id = getParam(req.params.id);
  const job = await getJobByIdService(id, req.identity);
  return res.json(job);
};

// ─────────────────────────────────────────────
// DELETE /api/job/:id
// ─────────────────────────────────────────────

export const deleteJob = async (req: UserRequest, res: Response) => {
  const identity = req.identity;
  const id = getParam(req.params.id);

  await deleteJobService(id, identity);

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
