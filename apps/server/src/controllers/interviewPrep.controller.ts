import { CVParsedSchema, JobParsedSchema } from '@applera/schemas';

import { deleteCache } from '../lib/cache.js';
import { getAbortSignal } from '../middleware/timeout.middleware.js';
import Application from '../models/Application.js';
import CV from '../models/CV.js';
import InterviewPrep from '../models/InterviewPrep.js';
import Job from '../models/Job.js';
import { auditLog } from '../services/audit/audit.service.js';
import { generateInterviewPrep } from '../services/interview/interviewPrep.service.js';
import { getParam } from '../utils/shared/param.utils.js';

import type { MatchReport } from '../types/schemas/match.schemas.js';
// ─────────────────────────────────────────────
// POST /api/interview/:applicationId
// ─────────────────────────────────────────────
import type { Request, Response } from 'express';

export const generatePrep = async (req: Request, res: Response) => {
  const signal = getAbortSignal(res);

  try {
    const applicationId = getParam(req.params.applicationId);

    const identity = req.identity;

    if (!identity) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    signal.throwIfAborted();

    const application = await Application.findOne({
      _id: applicationId,
      ownerId: identity.id,
      ownerType: identity.type,
    })
      .select('cv job match ownerId ownerType')
      .lean();

    if (!application) {
      return res.status(404).json({
        error: 'Application not found.',
      });
    }

    signal.throwIfAborted();

    const cvDoc = await CV.findById(application.cv).select('parsed').lean();

    const jobDoc = await Job.findById(application.job).select('parsed rawText').lean();

    const cv = cvDoc?.parsed;
    const job = jobDoc?.parsed;
    const rawText = jobDoc?.rawText;
    const match = application.match as MatchReport | undefined;

    if (!cv || !job) {
      return res.status(400).json({
        error: 'Missing CV or Job parsed data.',
      });
    }

    if (!match) {
      return res.status(400).json({
        error: 'Missing match data.',
      });
    }

    signal.throwIfAborted();

    const existing = await InterviewPrep.findOne({
      application: applicationId,
      ownerId: identity.id,
      ownerType: identity.type,
    })
      .select('regenerationCount')
      .lean();

    if (existing && existing.regenerationCount >= 3) {
      return res.status(429).json({
        error: 'Maximum regenerations reached.',
      });
    }

    await deleteCache(`interview:${applicationId}`);

    signal.throwIfAborted();

    const parsedCV = CVParsedSchema.safeParse(cv);
    const parsedJob = JobParsedSchema.safeParse(job);

    if (!parsedCV.success || !parsedJob.success) {
      return res.status(400).json({
        error: 'Invalid CV or Job parsed data.',
      });
    }

    signal.throwIfAborted();

    const prep = await generateInterviewPrep(
      parsedCV.data,
      parsedJob.data,
      rawText,
      match,
      applicationId,
      { signal },
    );

    signal.throwIfAborted();

    const saved = await InterviewPrep.findOneAndUpdate(
      {
        application: applicationId,
        ownerId: identity.id,
        ownerType: identity.type,
      },
      {
        application: applicationId,
        ownerId: identity.id,
        ownerType: identity.type,
        questions: prep.questions,
        general_tips: prep.general_tips,
        $inc: { regenerationCount: 1 },
      },
      {
        upsert: true,
        returnDocument: 'after',
      },
    );

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
    if (signal.aborted || (err instanceof Error && err.name === 'AbortError')) {
      console.warn('[generatePrep] aborted (timeout or disconnect)', {
        requestId: req.requestId,
      });

      return;
    }

    const message = err instanceof Error ? err.message : 'Unknown error';

    console.error('[generatePrep]', message);

    return res.status(500).json({
      error: message,
    });
  }
};

// ─────────────────────────────────────────────
// GET /api/interview/:applicationId
// ─────────────────────────────────────────────

export const getPrep = async (req: Request, res: Response) => {
  try {
    const applicationId = getParam(req.params.applicationId);

    const identity = req.identity;

    if (!identity) {
      return res.status(401).json({
        error: 'Unauthorized',
      });
    }

    const prep = await InterviewPrep.findOne({
      application: applicationId,
      ownerId: identity.id,
      ownerType: identity.type,
    });

    if (!prep) {
      return res.status(404).json({
        error: 'No interview prep found. Generate one first.',
      });
    }

    return res.json({ prep });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';

    console.error('[getPrep]', message);

    return res.status(500).json({
      error: message,
    });
  }
};
