import { CVParsedSchema } from '@repo/schemas';
import { z } from 'zod';

import { ApplicationLLMSchema } from './llm.schemas.js';
import { MatchReportSchema } from './match.schemas.js';
import { JobSchema } from './schema.js';

const SnapshotSchema = z.object({
  cvNameSnapshot: z.string(),
  jobTitleSnapshot: z.string(),
  companySnapshot: z.string(),
  locationSnapshot: z.string(),
});

export const PipelineResultSchema = z.object({
  cv: CVParsedSchema,
  job: JobSchema,
  snapshot: SnapshotSchema,
  match: MatchReportSchema,
  application: ApplicationLLMSchema,
});

export type PipelineResult = z.infer<typeof PipelineResultSchema>;
