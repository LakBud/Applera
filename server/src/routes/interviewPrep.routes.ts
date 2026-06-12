import express from 'express';
import { generatePrep, getPrep } from '../controllers/interviewPrep.controller.js';
import { applicationLimiter } from '../middleware/rateLimiter.js';
import { aiTimeout } from '../middleware/timeout.js';
import { idempotency } from '../middleware/idempotency.js';

const router = express.Router();

// POST /api/interview/:applicationId  — 1 LLM call, rate-limited
router.post('/:applicationId', idempotency, applicationLimiter, aiTimeout(60_000), generatePrep);

// GET /api/interview/:applicationId
router.get('/:applicationId', getPrep);

export default router;
