import { getDashboardForCV } from '../services/dashboard/dashboard.service.js';
import { getParam } from '../utils/shared/param.utils.js';

import type { UserRequest } from '../types/requests.js';
import type { Response } from 'express';

// GET /api/dashboard/:cvId
// Returns aggregated stats for all applications made with a given CV
export const getDashboard = async (req: UserRequest, res: Response) => {
  const cvId = getParam(req.params.cvId);
  const stats = await getDashboardForCV(cvId, req.identity);
  return res.json(stats);
};
