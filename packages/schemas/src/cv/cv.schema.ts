import { z } from 'zod';

import { ALLOWED_SENIORITY } from '../seniority.types.js';

export const CVParsedSchema = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  github: z.string().optional(),
  summary: z.string().optional(),
  seniority_level: z.enum(ALLOWED_SENIORITY).default('unknown'),
  location: z.string().optional(),

  skills: z.array(z.string()).default([]),

  experience: z
    .array(
      z.object({
        title: z.string().optional(),
        company: z.string().optional(),
        highlights: z.array(z.string()).default([]),
      }),
    )
    .default([]),

  education: z
    .array(
      z.object({
        title: z.string().optional(),
        school: z.string().optional(),
      }),
    )
    .default([]),

  projects: z
    .array(
      z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        url: z.string().optional(),
        tech: z.array(z.string()).default([]),
      }),
    )
    .default([]),
});

export const CVDocumentSchema = z.object({
  _id: z.string(),
  rawText: z.string().optional(),
  parsed: CVParsedSchema,

  applicationsCount: z.number().optional(),
  lastUsedAt: z.string().optional(),
  pinned: z.boolean().default(false),

  pdfUrl: z.string().optional(),
  previewUrl: z.string().optional(),
  cloudinaryPublicId: z.string().optional(),

  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const UploadCVResponseSchema = z.object({
  message: z.string(),
  cv: CVDocumentSchema,
});

export const CVExtractionSchema = CVParsedSchema.extend({
  seniority_level: z.string().default('unknown'),
});

export type CVParsed = z.infer<typeof CVParsedSchema>;
export type CVDocument = z.infer<typeof CVDocumentSchema>;
export type UploadCVResponse = z.infer<typeof UploadCVResponseSchema>;
