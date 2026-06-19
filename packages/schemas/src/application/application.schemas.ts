import { z } from 'zod';

import { ConfidenceSchema } from '../common/confidence.schema.js';
import { ApplicationStatusSchema } from '../common/status.schema.js';
import { CVDocumentSchema } from '../cv/cv.schemas.js';
import { JobDocumentSchema } from '../job/job.schemas.js';

export const MatchSchema = z.object({
  score: z.number(),
  confidence: ConfidenceSchema,
  strengths: z.array(z.string()),
  missing_skills: z.array(z.string()),
});

export const ApplicationSchema = z.object({
  _id: z.string(),

  cv: CVDocumentSchema.nullable(),
  job: JobDocumentSchema.nullable(),

  match: MatchSchema,

  tailored_cv_summary: z.string(),
  cover_letter: z.string(),

  jobTitleSnapshot: z.string().optional(),
  companySnapshot: z.string().optional(),
  locationSnapshot: z.string().optional(),
  cvNameSnapshot: z.string().optional(),

  application_email: z.object({
    subject: z.string(),
    body: z.string(),
  }),

  status: ApplicationStatusSchema,
  notes: z.string().optional(),

  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type Application = z.infer<typeof ApplicationSchema>;
