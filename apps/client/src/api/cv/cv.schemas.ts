import { ApplicationStatusSchema, CVDocumentSchema } from '@repo/schemas';
import { z } from 'zod';

import { ConfidenceSchema } from '../schemas';

export const UploadCVResponseSchema = z.object({
  message: z.string(),
  cv: CVDocumentSchema,
});

export type UploadCVResponse = z.infer<typeof UploadCVResponseSchema>;

export const DashboardCVSchema = z.object({
  cv_id: z.string(),

  total: z.number(),
  average_score: z.number(),
  highest_score: z.number(),

  best_match_id: z.string().nullable(),

  status_breakdown: z.partialRecord(ApplicationStatusSchema, z.number()),
  confidence_breakdown: z.partialRecord(ConfidenceSchema, z.number()),

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

export type DashboardCV = z.infer<typeof DashboardCVSchema>;
