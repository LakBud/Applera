import { getAbortSignal } from '../middleware/timeout.middleware.js';
import { auditLog } from '../services/audit/audit.service.js';
import {
  createInterviewPrep,
  getInterviewPrep,
} from '../services/interview/interviewPrep.service.js';
import { getParam } from '../utils/shared/param.utils.js';

import type { UserRequest } from '../types/requests.js';
import type { Response } from 'express';

// POST /api/interview/:applicationId
export const generatePrep = async (req: UserRequest, res: Response) => {
  const signal = getAbortSignal(res);

  try {
    const applicationId = getParam(req.params.applicationId);
    const identity = req.identity;

    const { prep, saved } = await createInterviewPrep(applicationId, identity, {
      signal,
      reserveUsage: req.reserveUsage,
      refundUsage: req.refundUsage,
    });

    await auditLog({
      event: 'INTERVIEW_PREP_GENERATED',
      userId: identity.id,
      userType: identity.type,
      requestId: req.requestId,
      ip: req.ip,
      resourceId: applicationId,
      metadata: {
        questionCount: prep.questions.length,
        prepId: String(saved._id),
      },
    });

    return res.status(201).json({
      prep: saved,
    });
  } catch (err: unknown) {
    if (signal.aborted) {
      console.warn('[generatePrep] aborted (timeout or disconnect)', {
        requestId: req.requestId,
      });

      return;
    }

    throw err;
  }
};

// GET /api/interview/:applicationId
export const getPrep = async (req: UserRequest, res: Response) => {
  const applicationId = getParam(req.params.applicationId);
  const prep = await getInterviewPrep(applicationId, req.identity);
  return res.json({ prep });
};
