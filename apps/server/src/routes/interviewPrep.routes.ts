import express from 'express';

import { generatePrep, getPrep } from '../controllers/interviewPrep.controller.js';
import { interviewPrepLimiter } from '../middleware/rate/rateLimiter.middleware.js';
import { usageLimiter } from '../middleware/rate/usageLimiter.middleware.js';
import { idempotency } from '../middleware/request/idempotency.middleware.js';
import { aiTimeout } from '../middleware/request/timeout.middleware.js';

const router = express.Router();

// POST /api/interview/:applicationId  — 1 LLM call, rate-limited
router.post(
  '/:applicationId',
  idempotency,
  interviewPrepLimiter,
  usageLimiter,
  aiTimeout(60_000),
  generatePrep,
);

// GET /api/interview/:applicationId
router.get('/:applicationId', getPrep);

export default router;
