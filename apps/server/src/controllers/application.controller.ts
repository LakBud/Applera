import {
  APPLICATION_STATUSES,
  CVParsedSchema,
  JobParsedSchema,
  type ApplicationStatus,
} from '@applera/schemas';

import { getAbortSignal } from '../middleware/timeout.middleware.js';
import Application from '../models/Application.js';
import CVModel from '../models/CV.js';
import JobModel from '../models/Job.js';
import { auditLog } from '../services/audit/audit.service.js';
import { runApplicationPipelineFromParsed } from '../services/pipeline/pipeline.service.js';
import { NotFoundError } from '../utils/errors/notFound.error.js';
import { getParam } from '../utils/shared/param.utils.js';

import type { UserRequest } from '../types/requests.js';
import type { Response } from 'express';

// ─────────────────────────────────────────────
// GET /api/application
// ─────────────────────────────────────────────

export const getApplications = async (req: UserRequest, res: Response) => {
  const { id: ownerId, type: ownerType } = req.identity;

  const applications = await Application.find({
    ownerId,
    ownerType,
  })
    .populate('cv', 'parsed applicationsCount lastUsedAt')
    .populate('job', 'parsed company location')
    .sort({ createdAt: -1 });

  return res.json({
    applications,
  });
};

// ─────────────────────────────────────────────
// GET /api/application/:id
// ─────────────────────────────────────────────

export const getApplicationById = async (req: UserRequest, res: Response) => {
  const id = getParam(req.params.id);

  const application = await Application.findOne({
    _id: id,
    ownerId: req.identity.id,
    ownerType: req.identity.type,
  })
    .populate('cv')
    .populate('job');

  if (!application) {
    throw new NotFoundError('Application not found');
  }

  return res.json({
    application,
  });
};

// ─────────────────────────────────────────────
// PATCH /api/application/:id/status
// ─────────────────────────────────────────────

export const updateApplicationStatus = async (req: UserRequest, res: Response) => {
  const { id: ownerId, type: ownerType } = req.identity;
  const id = getParam(req.params.id);
  const { status } = req.body;

  if (!APPLICATION_STATUSES.includes(status as ApplicationStatus)) {
    throw new NotFoundError(`Invalid status. Must be one of: ${APPLICATION_STATUSES.join(', ')}`);
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
      returnDocument: 'after',
    },
  )
    .populate('cv', 'parsed applicationsCount lastUsedAt')
    .populate('job', 'parsed company location');

  if (!updated) {
    throw new NotFoundError('Application not found');
  }

  await auditLog({
    event: 'APPLICATION_STATUS_UPDATED',
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
};

// ─────────────────────────────────────────────
// DELETE /api/application/:id
// ─────────────────────────────────────────────

export const deleteApplication = async (req: UserRequest, res: Response) => {
  const { id: ownerId, type: ownerType } = req.identity;
  const id = getParam(req.params.id);

  const deleted = await Application.findOneAndDelete({
    _id: id,
    ownerId,
    ownerType,
  });

  if (!deleted) {
    throw new NotFoundError('Application not found');
  }

  await auditLog({
    event: 'APPLICATION_DELETED',
    userId: ownerId,
    userType: ownerType,
    resourceId: id,
    requestId: req.requestId,
    ip: req.ip,
  });

  return res.json({
    message: 'Application deleted',
  });
};

// ─────────────────────────────────────────────
// POST /api/application
// ─────────────────────────────────────────────

export const createApplication = async (req: UserRequest, res: Response) => {
  const signal = getAbortSignal(res);

  try {
    const { id: ownerId, type: ownerType } = req.identity;
    const { cvId, jobId } = req.body;

    const [cv, job] = await Promise.all([
      CVModel.findOne({
        _id: { $eq: cvId },
        ownerId: { $eq: ownerId },
        ownerType: { $eq: ownerType },
      }),
      JobModel.findOne({
        _id: { $eq: jobId },
        ownerId: { $eq: ownerId },
        ownerType: { $eq: ownerType },
      }),
    ]);

    if (!cv || !job) {
      throw new NotFoundError('CV or Job not found');
    }

    if (!cv.parsed) throw new NotFoundError('CV not parsed');
    if (!job.parsed) throw new NotFoundError('Job not parsed');

    const parsedCV = CVParsedSchema.parse(cv.parsed);
    const parsedJob = JobParsedSchema.parse(job.parsed);

    const result = await runApplicationPipelineFromParsed(parsedCV, parsedJob, job.rawText ?? '', {
      signal,
      reserveUsage: req.reserveUsage,
      refundUsage: req.refundUsage,
    });

    const application = await Application.create({
      ownerId,
      ownerType,
      cv: cv._id,
      job: job._id,
      ...result.snapshot,
      match: result.match,
      tailoring_advice: result.application.tailoring_advice,
      cover_letter: [
        result.application.application_letter.introduction,
        result.application.application_letter.body,
        result.application.application_letter.closing,
      ].join('\n\n'),
      application_email: result.application.email_template,
      status: 'generated',
    });

    await application.populate('cv', 'parsed applicationsCount lastUsedAt');
    await application.populate('job', 'parsed company location');

    await auditLog({
      event: 'APPLICATION_CREATED',
      userId: ownerId,
      userType: ownerType,
      resourceId: String(application._id),
      requestId: req.requestId,
      ip: req.ip,
    });

    return res.status(201).json({
      application: application.toObject(),
    });
  } catch (err) {
    if (signal.aborted) {
      console.warn('[createApplication] aborted (timeout or disconnect)', {
        requestId: req.requestId,
      });
      return; // noopLateWrites already suppressed the actual res.json call
    }

    throw err;
  }
};
