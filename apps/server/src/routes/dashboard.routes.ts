import express from 'express';

import { getDashboard } from '../controllers/dashboard.controller.js';
import { validateRequest } from '../middleware/validate/request/validateRequest.middleware.js';
import { validateResponse } from '../middleware/validate/response/validateResponse.middleware.js';
import { withUser } from '../types/requests.js';

const router = express.Router();

// GET /api/dashboard/:cvId
router.get(
  '/:cvId',
  validateRequest('getCVDashboard'),
  validateResponse('dashboardCV'),
  withUser(getDashboard),
);

export default router;
