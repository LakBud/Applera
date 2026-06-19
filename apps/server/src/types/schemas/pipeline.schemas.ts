import { CVParsedSchema, JobParsedSchema } from '@repo/schemas';
import { z } from 'zod';

import { ApplicationLLMSchema } from './llm.schemas.js';
import { MatchReportSchema } from './match.schemas.js';

const SnapshotSchema = z.object({
  cvNameSnapshot: z.string(),
  jobTitleSnapshot: z.string(),
  companySnapshot: z.string(),
  locationSnapshot: z.string(),
});

export const PipelineResultSchema = z.object({
  cv: CVParsedSchema,
  job: JobParsedSchema,
  snapshot: SnapshotSchema,
  match: MatchReportSchema,
  application: ApplicationLLMSchema,
});

export type PipelineResult = z.infer<typeof PipelineResultSchema>;
