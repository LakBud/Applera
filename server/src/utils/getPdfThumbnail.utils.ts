import { cloudinary } from '../config/cloudinary.js';

export function getPdfThumbnail(publicId: string) {
  return cloudinary.url(publicId, {
    format: 'png',
    page: 1,
    transformation: [{ width: 500, crop: 'fit' }, { quality: 'auto' }],
  });
}
