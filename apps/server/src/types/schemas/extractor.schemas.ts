import { CVParsedSchema, JobParsedSchema } from '@repo/schemas';
import { z } from 'zod';

export const CVExtractionSchema = CVParsedSchema.extend({
  seniority_level: z.string().default('unknown'),
});

export const JobExtractionSchema = JobParsedSchema.extend({
  seniority: z.string().default('unknown'),
});
