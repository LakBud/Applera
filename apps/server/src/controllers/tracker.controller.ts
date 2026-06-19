import type { Request, Response } from 'express';

import Application, { APPLICATION_STATUSES } from '../models/Application.js';
import { auditLog } from '../services/audit/audit.service.js';
import { getParam } from '../utils/shared/param.utils.js';

// ─────────────────────────────────────────────
// GET /api/tracker/:cvId
// ─────────────────────────────────────────────

export const getApplicationsByCv = async (req: Request, res: Response) => {
  try {
    if (!req.identity) {
      return res.status(401).json({
        error: 'Unauthorized',
      });
    }

    const cvId = getParam(req.params.cvId);

    const applications = await Application.find({
      ownerId: req.identity.id,
      ownerType: req.identity.type,
      cv: cvId,
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
`,
      )
      .lean()
      .sort({ createdAt: -1 });

    return res.json({ applications });
  } catch (err) {
    console.error('[getApplicationsByCv]', err);

    return res.status(500).json({
      error: 'Failed to fetch applications',
    });
  }
};

// ─────────────────────────────────────────────
// GET /api/tracker/application/:id
// ─────────────────────────────────────────────

export const getApplication = async (req: Request, res: Response) => {
  try {
    if (!req.identity) {
      return res.status(401).json({
        error: 'Unauthorized',
      });
    }

    const id = getParam(req.params.id);

    const application = await Application.findOne({
      _id: id,
      ownerId: req.identity.id,
      ownerType: req.identity.type,
    })
      .populate('cv')
      .populate('job');

    if (!application) {
      return res.status(404).json({
        error: 'Application not found.',
      });
    }

    return res.json({
      application,
    });
  } catch (err) {
    console.error('[getApplication]', err);

    return res.status(500).json({
      error: 'Failed to fetch application',
    });
  }
};

// ─────────────────────────────────────────────
// PATCH /api/tracker/application/:id/status
// ─────────────────────────────────────────────

export const updateStatus = async (req: Request, res: Response) => {
  try {
    if (!req.identity) {
      return res.status(401).json({
        error: 'Unauthorized',
      });
    }

    const id = getParam(req.params.id);
    const { status, notes } = req.body;

    if (!APPLICATION_STATUSES.includes(status)) {
      return res.status(400).json({
        error: `Invalid status. Must be one of: ${APPLICATION_STATUSES.join(', ')}`,
      });
    }

    if (notes !== undefined && typeof notes !== 'string') {
      return res.status(400).json({ error: 'Invalid notes value' });
    }

    const update: Record<string, unknown> = { status };
    if (notes !== undefined) {
      update.notes = notes;
    }

    const application = await Application.findOneAndUpdate(
      {
        _id: { $eq: id },
        ownerId: { $eq: req.identity.id },
        ownerType: { $eq: req.identity.type },
      },
      { $set: update },
      { new: true },
    );

    if (!application) {
      return res.status(404).json({
        error: 'Application not found.',
      });
    }

    await auditLog({
      event: 'APPLICATION_STATUS_CHANGED',
      userId: req.identity.id,
      userType: req.identity.type,
      resourceId: id,
      requestId: req.requestId,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      metadata: {
        newStatus: status,
        notes: notes ?? null,
      },
    });

    return res.json({
      application,
    });
  } catch (err) {
    console.error('[updateStatus]', err);

    return res.status(500).json({
      error: 'Failed to update status',
    });
  }
};
