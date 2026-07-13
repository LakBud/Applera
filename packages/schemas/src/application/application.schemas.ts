import { z } from 'zod';

import { ApplicationStatusSchema } from '../common/status.schemas.js';
import { CVDocumentSchema } from '../cv/cv.schemas.js';
import { JobDocumentSchema } from '../job/job.schemas.js';
import { MatchSchema } from './match.schemas.js';

export const ApplicationSchema = z.object({
  _id: z.string(),

  cv: CVDocumentSchema.nullable(),
  job: JobDocumentSchema.nullable(),

  match: MatchSchema,

  tailoring_advice: z.string(),
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

  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type Application = z.infer<typeof ApplicationSchema>;
