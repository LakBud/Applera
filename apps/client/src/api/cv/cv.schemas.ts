import { z } from 'zod';

import { ApplicationStatusSchema } from '../application/application.schemas';
import { ConfidenceSchema } from '../schemas';

export const CVParsedSchema = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  github: z.string().optional(),
  summary: z.string().optional(),
  seniority_level: z.string().optional(),
  location: z.string().optional(),

  skills: z.array(z.string()),

  experience: z.array(
    z.object({
      title: z.string().optional(),
      company: z.string().optional(),
      highlights: z.array(z.string()),
    }),
  ),

  education: z.array(
    z.object({
      title: z.string().optional(),
      school: z.string().optional(),
    }),
  ),

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

export const DashboardCVSchema = z.object({
  cv_id: z.string(),

  total: z.number(),
  average_score: z.number(),
  highest_score: z.number(),

  best_match_id: z.string().nullable(),

  status_breakdown: z.record(z.string(), z.number()),
  confidence_breakdown: z.record(z.string(), z.number()),

  applications: z.array(
    z.object({
      _id: z.string(),
      job_title: z.string(),
      company: z.string().optional(),
      location: z.string().optional(),
      score: z.number(),
      confidence: ConfidenceSchema,
      status: ApplicationStatusSchema,
      notes: z.string().optional(),
      createdAt: z.string(),
    }),
  ),
});

export type UploadCVResponse = z.infer<typeof UploadCVResponseSchema>;
export type CVDocument = z.infer<typeof CVDocumentSchema>;
export type CVParsed = z.infer<typeof CVParsedSchema>;

export type DashboardCV = z.infer<typeof DashboardCVSchema>;
