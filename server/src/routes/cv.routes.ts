import express from 'express';

import {
  createCV,
  deleteCV,
  getCVById,
  getCVPdf,
  getCVs,
  pinCV,
} from '../controllers/cv.controller.js';
import { concurrencyLimit } from '../middleware/concurrency.js';
import { parseCvPdf } from '../middleware/parsePdf.js';
import { parseLimiter } from '../middleware/rateLimiter.js';
import { aiTimeout } from '../middleware/timeout.js';
import { handleUploadError, uploadCV, validatePdfMagic } from '../middleware/upload.js';
import { validate } from '../middleware/validate.js';

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
  validatePdfMagic,
  validate('uploadCV'),
  parseCvPdf,
  handleUploadError,
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
router.delete('/:id', deleteCV);

router.patch('/:id/pin', pinCV);

export default router;
