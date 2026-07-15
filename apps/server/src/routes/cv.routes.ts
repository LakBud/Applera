import express from 'express';

import {
  createCV,
  deleteCV,
  getCVById,
  getCVPdf,
  getCVPreview,
  getCVs,
  pinCV,
} from '../controllers/cv.controller.js';
import { idempotency } from '../middleware/idempotency.middleware.js';
import { parseCvPdf } from '../middleware/pdf/parsePdf.middleware.js';
import { concurrencyLimit } from '../middleware/rate/concurrency.middleware.js';
import { deleteCVLimiter, parseLimiter } from '../middleware/rate/rateLimiter.middleware.js';
import { usageLimiter } from '../middleware/rate/usageLimiter.middleware.js';
import { aiTimeout } from '../middleware/timeout.middleware.js';
import {
  handleUploadError,
  uploadCV,
  validatePdfMagic,
} from '../middleware/upload/upload.middleware.js';
import { validateRequest } from '../middleware/validate/request/validateRequest.middleware.js';
import { validateResponse } from '../middleware/validate/response/validateResponse.middleware.js';
import { withUser } from '../types/requests.js';

const router = express.Router();

// GET /api/cv
router.get('/', validateResponse('cvListResponse'), withUser(getCVs));

// POST /api/cv — upload CV (file or text)
router.post(
  '/',
  concurrencyLimit(5),
  parseLimiter,
  uploadCV,
  handleUploadError,
  aiTimeout(60_000),
  idempotency,
  validatePdfMagic,
  parseCvPdf,
  validateRequest('uploadCV'),
  usageLimiter,
  validateResponse('uploadCVResponse'),
  withUser(createCV),
);

// GET /api/cv/:id
router.get(
  '/:id',
  validateRequest('getCVById'),
  validateResponse('cvDocument'),
  withUser(getCVById),
);

// GET /api/cv/:id/pdf
router.get('/:id/pdf', withUser(getCVPdf));

// GET /api/cv/:id/preview
router.get('/:id/preview', withUser(getCVPreview));

// DELETE /api/cv/:id
router.delete(
  '/:id',
  deleteCVLimiter,
  validateRequest('deleteCVById'),
  validateResponse('messageResponse'),
  withUser(deleteCV),
);

// PATCH /api/cv/:id/pin
router.patch(
  '/:id/pin',
  validateRequest('pinCV'),
  validateResponse('pinCVResponse'),
  withUser(pinCV),
);

export default router;
