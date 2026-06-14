import { z } from 'zod';

import type { ApplicationLLMOutput } from './application.types.js';
import type { MatchReport } from './match.types.js';
import { CVSchema, JobSchema } from './schemas/schema.js';

export type PipelineResult = {
  cv: z.infer<typeof CVSchema>;
  job: z.infer<typeof JobSchema>;
  match: MatchReport;
  application: ApplicationLLMOutput;
};
