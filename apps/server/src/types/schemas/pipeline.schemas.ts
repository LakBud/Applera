import { z } from 'zod';

import { ApplicationLLMSchema } from './llm.schemas.js';
import { MatchReportSchema } from './match.schemas.js';
import { CVSchema, JobSchema } from './schema.js';

const SnapshotSchema = z.object({
  cvNameSnapshot: z.string(),
  jobTitleSnapshot: z.string(),
  companySnapshot: z.string(),
  locationSnapshot: z.string(),
});

export const PipelineResultSchema = z.object({
  cv: CVSchema,
  job: JobSchema,
  snapshot: SnapshotSchema,
  match: MatchReportSchema,
  application: ApplicationLLMSchema,
});

export type PipelineResult = z.infer<typeof PipelineResultSchema>;
