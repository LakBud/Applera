import express from 'express';

import {
  createCV,
  deleteCV,
  getCVById,
  getCVPdf,
  getCVs,
  pinCV,
} from '../controllers/cv.controller.js';
import { parseCvPdf } from '../middleware/pdf/parsePdf.middleware.js';
import { concurrencyLimit } from '../middleware/rate/concurrency.middleware.js';
import { deleteCVLimiter, parseLimiter } from '../middleware/rate/rateLimiter.middleware.js';
import { usageLimiter } from '../middleware/rate/usageLimiter.middleware.js';
import { aiTimeout } from '../middleware/request/timeout.middleware.js';
import { validate } from '../middleware/request/validate/validate.middleware.js';
import {
  handleUploadError,
  uploadCV,
  validatePdfMagic,
} from '../middleware/upload/upload.middleware.js';

const router = express.Router();

/**
 * GET /api/cv
 * List all CVs
 */
router.get('/', getCVs);

/**
 * POST /api/cv
 * Upload CV (file or text)
 */
router.post(
  '/',
  concurrencyLimit(5),
  parseLimiter,
  uploadCV,
  handleUploadError,
  validatePdfMagic,
  parseCvPdf,
  validate('uploadCV'),
  usageLimiter,
  aiTimeout(60_000),
  createCV,
);

/**
 * GET /api/cv/:id
 * Get single CV
 */
router.get('/:id', getCVById);

/**
 * GET /api/cv/:id/pdf
 * Get pdf of CV
 */
router.get('/:id/pdf', getCVPdf);

/**
 * DELETE /api/cv/:id
 * Delete CV
 */
router.delete('/:id', deleteCVLimiter, deleteCV);

router.patch('/:id/pin', pinCV);

export default router;
