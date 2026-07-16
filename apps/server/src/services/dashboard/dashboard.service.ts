import Application from '../../models/Application.js';
import CV from '../../models/CV.js';
import { NotFoundError } from '../../utils/errors/notFound.error.js';
import { buildDashboardStats } from './dashboardStats.service.js';

import type { Identity } from '../../types/schemas/identity.schemas.js';

// Service for GET /api/dashboard/:cvId
export async function getDashboardForCV(cvId: string, identity: Identity) {
  const { id: ownerId, type: ownerType } = identity;

  // CV
  const cvDoc = await CV.findOne({
    _id: cvId,
    ownerId,
    ownerType,
  }).lean();

  if (!cvDoc) {
    throw new NotFoundError('CV not found');
  }

  // Applications
  const applications = await Application.find({
    ownerId,
    ownerType,
    cv: cvDoc._id,
  })
    .select('match status createdAt jobTitleSnapshot companySnapshot locationSnapshot')
    .sort({ createdAt: -1 })
    .lean();

  return buildDashboardStats(cvDoc._id, applications);
}
