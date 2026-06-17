import { Request, Response } from 'express';

import Application, { APPLICATION_STATUSES, ApplicationStatus } from '../models/Application.js';
import CVModel from '../models/CV.js';
import JobModel from '../models/Job.js';
import { auditLog } from '../services/audit/audit.service.js';
import { runApplicationPipelineFromParsed } from '../services/pipeline/pipeline.service.js';
import { CVSchema, JobSchema } from '../types/schemas/schema.js';
import { getParam } from '../utils/shared/param.utils.js';

// ─────────────────────────────────────────────
// GET /api/application
// ─────────────────────────────────────────────

export const getApplications = async (req: Request, res: Response) => {
  try {
    if (!req.identity) {
      return res.status(401).json({
        error: 'Unauthorized',
      });
    }

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
  } catch (err) {
    console.error('[getApplications]', err);

    return res.status(500).json({
      error: 'Failed to fetch applications',
    });
  }
};

// ─────────────────────────────────────────────
// GET /api/application/:id
// ─────────────────────────────────────────────

export const getApplicationById = async (req: Request, res: Response) => {
  try {
    if (!req.identity) {
      return res.status(401).json({
        error: 'Unauthorized',
      });
    }

    const { id: ownerId, type: ownerType } = req.identity;
    const id = getParam(req.params.id);

    const application = await Application.findOne({
      _id: id,
      ownerId,
      ownerType,
    })
      .select(
        `
    _id
    jobTitleSnapshot
    companySnapshot
    locationSnapshot
    cvNameSnapshot
    match
    status
    createdAt
    notes
    tailored_cv_summary
    cover_letter
    application_email
  `,
      )
      .lean();

    if (!application) {
      return res.status(404).json({
        error: 'Application not found',
      });
    }

    return res.json({
      application,
    });
  } catch (err) {
    console.error('[getApplicationById]', err);

    return res.status(500).json({
      error: 'Failed to fetch application',
    });
  }
};

// ─────────────────────────────────────────────
// PATCH /api/application/:id/status
// ─────────────────────────────────────────────

export const updateApplicationStatus = async (req: Request, res: Response) => {
  try {
    if (!req.identity) {
      return res.status(401).json({
        error: 'Unauthorized',
      });
    }

    const { id: ownerId, type: ownerType } = req.identity;
    const id = getParam(req.params.id);
    const { status } = req.body;

    if (!APPLICATION_STATUSES.includes(status as ApplicationStatus)) {
      return res.status(400).json({
        error: `Invalid status. Must be one of: ${APPLICATION_STATUSES.join(', ')}`,
      });
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
        new: true,
      },
    )
      .populate('cv', 'parsed applicationsCount lastUsedAt')
      .populate('job', 'parsed company location');

    if (!updated) {
      return res.status(404).json({
        error: 'Application not found',
      });
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
  } catch (err) {
    console.error('[updateApplicationStatus]', err);

    return res.status(500).json({
      error: 'Failed to update status',
    });
  }
};

// ─────────────────────────────────────────────
// DELETE /api/application/:id
// ─────────────────────────────────────────────

export const deleteApplication = async (req: Request, res: Response) => {
  try {
    if (!req.identity) {
      return res.status(401).json({
        error: 'Unauthorized',
      });
    }

    const { id: ownerId, type: ownerType } = req.identity;
    const id = getParam(req.params.id);

    const deleted = await Application.findOneAndDelete({
      _id: id,
      ownerId,
      ownerType,
    });

    if (!deleted) {
      return res.status(404).json({
        error: 'Application not found',
      });
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
  } catch (err) {
    console.error('[deleteApplication]', err);

    return res.status(500).json({
      error: 'Failed to delete application',
    });
  }
};

// ─────────────────────────────────────────────
// POST /api/application
// ─────────────────────────────────────────────

export const createApplication = async (req: Request, res: Response) => {
  try {
    if (!req.identity) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id: ownerId, type: ownerType } = req.identity;
    const { cvId, jobId } = req.body;

    if (!cvId || !jobId) {
      return res.status(400).json({ error: 'cvId and jobId are required' });
    }

    if (typeof cvId !== 'string' || typeof jobId !== 'string') {
      return res.status(400).json({ error: 'cvId and jobId must be strings' });
    }

    // DB lookups
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
      return res.status(404).json({ error: 'CV or Job not found' });
    }

    if (!cv.parsed) return res.status(404).json({ error: 'CV not parsed' });

    if (!job.parsed) return res.status(404).json({ error: 'Job not parsed' });

    const parsedCV = CVSchema.parse(cv.parsed);
    const parsedJob = JobSchema.parse(job.parsed);

    // delegate all business logic to pipeline
    const result = await runApplicationPipelineFromParsed(parsedCV, parsedJob);

    // DB write
    const application = await Application.create({
      ownerId,
      ownerType,
      cv: cv._id,
      job: job._id,
      ...result.snapshot,
      match: result.match,
      tailored_cv_summary: result.application.cv_summary,
      cover_letter: [
        result.application.application_letter.introduction,
        result.application.application_letter.body,
        result.application.application_letter.closing,
      ].join('\n\n'),
      application_email: result.application.email_template,
      status: 'generated',
    });

    // Match getApplications populate fields exactly
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
    console.error('[createApplication]', err);
    return res.status(500).json({ error: 'Failed to create application' });
  }
};
