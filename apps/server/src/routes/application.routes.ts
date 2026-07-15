import express from 'express';

import {
  createApplication,
  deleteApplication,
  getApplicationById,
  getApplications,
  updateApplicationStatus,
} from '../controllers/application.controller.js';
import { idempotency } from '../middleware/idempotency.middleware.js';
import { applicationLimiter } from '../middleware/rate/rateLimiter.middleware.js';
import { usageLimiter } from '../middleware/rate/usageLimiter.middleware.js';
import { aiTimeout } from '../middleware/timeout.middleware.js';
import { validateRequest } from '../middleware/validate/request/validateRequest.middleware.js';
import { validateResponse } from '../middleware/validate/response/validateResponse.middleware.js';
import { withUser } from '../types/requests.js';

const router = express.Router();

// POST /api/application
router.post(
  '/',
  aiTimeout(60_000),
  idempotency,
  validateRequest('createApplication'),
  applicationLimiter,
  usageLimiter,
  validateResponse('applicationResponse'),
  withUser(createApplication),
);

// GET /api/application
router.get('/', validateResponse('applicationListResponse'), withUser(getApplications));

// GET /api/application/:id
router.get(
  '/:id',
  validateRequest('getApplicationById'),
  validateResponse('applicationResponse'),
  withUser(getApplicationById),
);

// PATCH /api/application/:id/status
router.patch(
  '/:id/status',
  validateRequest('updateApplicationStatus'),
  validateResponse('applicationResponse'),
  withUser(updateApplicationStatus),
);

// DELETE /api/application/:id
router.delete(
  '/:id',
  validateRequest('deleteApplication'),
  validateResponse('messageResponse'),
  withUser(deleteApplication),
);

export default router;
