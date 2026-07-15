import { cloudinary } from '../../config/cloudinary.js';
import CV from '../../models/CV.js';

export async function deleteUserCloudinaryAssets(clerkId: string) {
  const cvs = await CV.find({
    ownerId: clerkId,
    cloudinaryPublicId: { $exists: true, $ne: null },
  });

  const ids = cvs.map((cv) => cv.cloudinaryPublicId).filter(Boolean) as string[];

  await Promise.allSettled(
    ids.map((id) => cloudinary.uploader.destroy(id, { resource_type: 'image' })),
  );
}
