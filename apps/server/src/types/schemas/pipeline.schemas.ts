import { z } from 'zod';

import { ApplicationLLMOutput } from './llm.schemas.js';
import { MatchReport } from './match.schemas.js';
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
});

export type PipelineResult = z.infer<typeof PipelineResultSchema> & {
  match: MatchReport;
  application: ApplicationLLMOutput;
};
