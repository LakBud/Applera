import express from 'express';

import { createJob, deleteJob, getJobById, getJobs } from '../controllers/job.controller.js';
import { parseJobPdf } from '../middleware/pdf/parsePdf.middleware.js';
import { concurrencyLimit } from '../middleware/rate/concurrency.middleware.js';
import { parseLimiter } from '../middleware/rate/rateLimiter.middleware.js';
import { usageLimiter } from '../middleware/rate/usageLimiter.middleware.js';
import { aiTimeout } from '../middleware/request/timeout.middleware.js';
import { validate } from '../middleware/request/validate/validate.middleware.js';
import {
  handleUploadError,
  uploadJob,
  validatePdfMagic,
} from '../middleware/upload/upload.middleware.js';

const router = express.Router();

// ─────────────────────────────────────────────
// CREATE JOB
// POST /api/job
// ─────────────────────────────────────────────
router.post(
  '/',
  concurrencyLimit(5),
  usageLimiter,
  parseLimiter,
  uploadJob,
  handleUploadError,
  validatePdfMagic,
  parseJobPdf,
  validate('createJob'),
  aiTimeout(60_000),
  createJob,
);

// ─────────────────────────────────────────────
// GET ALL JOBS
// ─────────────────────────────────────────────
router.get('/', getJobs);

// ─────────────────────────────────────────────
// GET JOB BY ID
// ─────────────────────────────────────────────
router.get('/:id', getJobById);

// ─────────────────────────────────────────────
// DELETE JOB
// ─────────────────────────────────────────────
router.delete('/:id', deleteJob);

export default router;
