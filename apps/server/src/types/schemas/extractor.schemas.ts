import { ALLOWED_SENIORITY, CVParsedSchema, JobParsedSchema } from '@repo/schemas';
import { z } from 'zod';

const SenioritySchema = z.enum(ALLOWED_SENIORITY);

export const CVExtractionSchema = CVParsedSchema.extend({
  seniority_level: SenioritySchema.catch('unknown'),
});

export const JobExtractionSchema = JobParsedSchema.extend({
  seniority: SenioritySchema.catch('unknown'),
});
