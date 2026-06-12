import express from 'express';
import { uploadJob, validatePdfMagic, handleUploadError } from '../middleware/upload.js';

import { parseLimiter } from '../middleware/rateLimiter.js';
import { validate } from '../middleware/validate.js';
import { aiTimeout } from '../middleware/timeout.js';
import { concurrencyLimit } from '../middleware/concurrency.js';

import { createJob, getJobs, getJobById, deleteJob } from '../controllers/job.controller.js';

import { parseJobPdf } from '../middleware/parsePdf.js';

const router = express.Router();

// ─────────────────────────────────────────────
// CREATE JOB
// POST /api/job
// ─────────────────────────────────────────────
router.post(
  '/',

  concurrencyLimit(5), // 0. safety: concurrent control
  parseLimiter, // 1. rate limit

  uploadJob, // 2. multer upload
  handleUploadError, // 3. MUST be immediately after upload

  validatePdfMagic, // 4. file safety check

  parseJobPdf, // 5. extract PDF text

  validate('createJob'), // 6. validate FINAL merged input (IMPORTANT FIX)

  aiTimeout(60_000), // 7. LLM timeout protection

  createJob, // 8. controller
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
