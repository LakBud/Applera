import { cloudinary } from '../../config/cloudinary.js';
import CV from '../../models/CV.js';
import { AppAggregateError } from '../../utils/errors/aggregate.error.js';

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
