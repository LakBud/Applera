import { z } from 'zod';

import { ALLOWED_SENIORITY } from '../types/seniority.types.js';

export const JobParsedSchema = z.object({
  title: z.string(),
  company: z.string(),
  location: z.string().optional(),
  required_skills: z.array(z.string()).default([]),
  responsibilities: z.array(z.string()).default([]),
  seniority: z.enum(ALLOWED_SENIORITY).default('unknown'),
  raw_description: z.string().optional(),
});

export const JobDocumentSchema = z.object({
  _id: z.string(),
  rawText: z.string().optional(),
  parsed: JobParsedSchema,

  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type JobParsed = z.infer<typeof JobParsedSchema>;
export type JobDocument = z.infer<typeof JobDocumentSchema>;
