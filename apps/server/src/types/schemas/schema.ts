import { z } from 'zod';

import { ALLOWED_SENIORITY } from '../seniority.types.js';

export const JobSchema = z.object({
  title: z.string().default(''),
  company: z.string().default(''),
  location: z.string().default(''),
  required_skills: z.array(z.string()).default([]),
  responsibilities: z.array(z.string()).default([]),
  seniority: z.enum(ALLOWED_SENIORITY).default('unknown'),
  raw_description: z.string().default(''),
});

export const JobExtractionSchema = JobSchema.extend({
  seniority: z.string().default('unknown'),
});

export type JobSchemaData = z.infer<typeof JobSchema>;
