import express from 'express';

import { createJob, deleteJob, getJobById, getJobs } from '../controllers/job.controller.js';
import { withUser } from '../middleware/global/user.middleware.js';
import { idempotency } from '../middleware/idempotency.middleware.js';
import { parseJobPdf } from '../middleware/pdf/parsePdf.middleware.js';
import { concurrencyLimit } from '../middleware/rate/concurrency.middleware.js';
import { parseLimiter } from '../middleware/rate/rateLimiter.middleware.js';
import { usageLimiter } from '../middleware/rate/usageLimiter.middleware.js';
import { aiTimeout } from '../middleware/timeout.middleware.js';
import {
  handleUploadError,
  uploadJob,
  validatePdfMagic,
} from '../middleware/upload/upload.middleware.js';
import { validateRequest } from '../middleware/validate/request/validateRequest.middleware.js';
import { validateResponse } from '../middleware/validate/response/validateResponse.middleware.js';

const router = express.Router();

// POST /api/job
router.post(
  '/',
  concurrencyLimit(5),
  usageLimiter,
  parseLimiter,
  uploadJob,
  handleUploadError,
  aiTimeout(60_000),
  idempotency,
  validatePdfMagic,
  parseJobPdf,
  validateRequest('createJob'),
  validateResponse('createJobResponse'),
  withUser(createJob),
);

// GET /api/job
router.get('/', validateResponse('jobListResponse'), withUser(getJobs));

// GET /api/job/:id
router.get(
  '/:id',
  validateRequest('getJobById'),
  validateResponse('jobDocument'),
  withUser(getJobById),
);

// DELETE /api/job/:id
router.delete(
  '/:id',
  validateRequest('deleteJobById'),
  validateResponse('messageResponse'),
  withUser(deleteJob),
);

export default router;
