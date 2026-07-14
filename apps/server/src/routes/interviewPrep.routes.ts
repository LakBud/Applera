import express from 'express';

import { generatePrep, getPrep } from '../controllers/interviewPrep.controller.js';
import { idempotency } from '../middleware/idempotency.middleware.js';
import { interviewPrepLimiter } from '../middleware/rate/rateLimiter.middleware.js';
import { usageLimiter } from '../middleware/rate/usageLimiter.middleware.js';
import { aiTimeout } from '../middleware/timeout.middleware.js';
import { validateRequest } from '../middleware/validate/request/validateRequest.middleware.js';
import { validateResponse } from '../middleware/validate/response/validateResponse.middleware.js';

const router = express.Router();

// POST /api/interview/:applicationId
router.post(
  '/:applicationId',
  aiTimeout(60_000),
  idempotency,
  validateRequest('generatePrep'),
  interviewPrepLimiter,
  usageLimiter,
  validateResponse('interviewPrepResponse'),
  generatePrep,
);

// GET /api/interview/:applicationId
router.get(
  '/:applicationId',
  validateRequest('getInterviewPrep'),
  validateResponse('interviewPrepResponse'),
  getPrep,
);

export default router;
