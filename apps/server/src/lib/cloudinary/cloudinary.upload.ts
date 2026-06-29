import { cloudinary } from '../../config/cloudinary.js';

export async function uploadImage(buffer: Buffer, userId: string) {
  return cloudinary.uploader.upload(`data:application/pdf;base64,${buffer.toString('base64')}`, {
    resource_type: 'image',
    folder: `cvs/${userId}`,
    public_id: `cv_${Date.now()}`,
    overwrite: true,
    invalidate: true,
    type: 'authenticated',
  });
}
