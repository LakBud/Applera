import { z } from 'zod';

import { ConfidenceSchema } from '../common/confidence.schema.js';
import { ApplicationStatusSchema } from '../common/status.schema.js';

export const DashboardCVSchema = z.object({
  cv_id: z.string(),

  total: z.number(),
  average_score: z.number(),
  highest_score: z.number(),

  best_match_id: z.string().nullable(),

  status_breakdown: z.record(ApplicationStatusSchema, z.number()),
  confidence_breakdown: z.record(ConfidenceSchema, z.number()),

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
