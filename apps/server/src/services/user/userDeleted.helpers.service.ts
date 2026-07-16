import { Types } from 'mongoose';

import { cloudinary } from '../../config/cloudinary.js';
import { deleteCache, deleteCachePattern } from '../../lib/cache.js';
import Application from '../../models/Application.js';
import CV from '../../models/CV.js';
import InterviewPrep from '../../models/InterviewPrep.js';
import Job from '../../models/Job.js';
import User from '../../models/User.js';
import { AppAggregateError } from '../../utils/errors/aggregate.error.js';

export async function clearUserCache(clerkId: string, applicationIds: Types.ObjectId[]) {
  const results = await Promise.allSettled([
    ...applicationIds.map((id) => deleteCache(`interview:${id.toString()}`)),

    ...applicationIds.map((id) => deleteCachePattern(`application:*${id.toString()}*`)),

    deleteCachePattern(`*${clerkId}*`),
  ]);

  const rejected = results.filter(
    (result): result is PromiseRejectedResult => result.status === 'rejected',
  );

  if (rejected.length > 0) {
    throw new AppAggregateError(
      rejected.map((result) => result.reason),
      `Failed to invalidate ${rejected.length} of ${results.length} cache entr${
        rejected.length === 1 ? 'y' : 'ies'
      } for user ${clerkId}`,
    );
  }
}

export async function deleteUserCloudinaryAssets(clerkId: string) {
  const cvs = await CV.find({
    ownerId: clerkId,
    cloudinaryPublicId: { $exists: true, $ne: null },
  });

  const ids = cvs.map((cv) => cv.cloudinaryPublicId).filter(Boolean) as string[];

  const results = await Promise.allSettled(
    ids.map((id) => cloudinary.uploader.destroy(id, { resource_type: 'image' })),
  );

  const rejected = results.filter(
    (result): result is PromiseRejectedResult => result.status === 'rejected',
  );

  if (rejected.length > 0) {
    throw new AppAggregateError(
      rejected.map((result) => result.reason),
      `Failed to delete ${rejected.length} of ${ids.length} Cloudinary asset(s) for user ${clerkId}`,
    );
  }
}

export async function deleteUserRecords(clerkId: string, applicationIds: Types.ObjectId[]) {
  await Promise.all([
    InterviewPrep.deleteMany({
      application: { $in: applicationIds },
    }),
    Application.deleteMany({ ownerId: clerkId }),
    CV.deleteMany({ ownerId: clerkId }),
    Job.deleteMany({ ownerId: clerkId }),
    User.deleteOne({ clerkId }),
  ]);
}
