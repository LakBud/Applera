import { getAbortSignal } from '../middleware/timeout.middleware.js';
import {
  createApplication as createApplicationService,
  deleteApplication as deleteApplicationService,
  getApplicationById as getApplicationByIdService,
  listApplications,
  updateApplicationStatus as updateApplicationStatusService,
} from '../services/application/application.service.js';
import { auditLog } from '../services/audit/audit.service.js';
import { getParam } from '../utils/shared/param.utils.js';

import type { UserRequest } from '../types/requests.js';
import type { Response } from 'express';

// ─────────────────────────────────────────────
// GET /api/application
// ─────────────────────────────────────────────

export const getApplications = async (req: UserRequest, res: Response) => {
  const applications = await listApplications(req.identity);

  return res.json({
    applications,
  });
};

// ─────────────────────────────────────────────
// GET /api/application/:id
// ─────────────────────────────────────────────

export const getApplicationById = async (req: UserRequest, res: Response) => {
  const id = getParam(req.params.id);
  const application = await getApplicationByIdService(id, req.identity);

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

  const updated = await updateApplicationStatusService(id, req.identity, status);

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

  await deleteApplicationService(id, req.identity);

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

    const application = await createApplicationService(req.identity, cvId, jobId, {
      signal,
      reserveUsage: req.reserveUsage,
      refundUsage: req.refundUsage,
    });

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
