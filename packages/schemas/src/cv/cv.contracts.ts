import { z } from 'zod';

import { CVDocumentSchema } from './cv.schemas';

export const UploadCVResponseSchema = z.object({
  message: z.string(),
  cv: CVDocumentSchema,
});

export type UploadCVResponse = z.infer<typeof UploadCVResponseSchema>;

export const CVListResponseSchema = z.array(CVDocumentSchema);

export type CVListResponse = z.infer<typeof CVListResponseSchema>;

export const PinCVResponseSchema = z.object({
  cv: CVDocumentSchema,
  pinned: z.boolean(),
});

export type PinCVResponse = z.infer<typeof PinCVResponseSchema>;
