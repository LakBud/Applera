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

export const CVSchema = z.object({
  name: z.string(),
  email: z.string(),
  phone: z.string(),
  github: z.string(),
  summary: z.string(),
  seniority_level: z.enum(ALLOWED_SENIORITY).default('unknown'),
  skills: z.array(z.string()).default([]),

  experience: z
    .array(
      z.object({
        title: z.string(),
        company: z.string(),
        highlights: z.array(z.string()),
      }),
    )
    .default([]),

  education: z
    .array(
      z.object({
        title: z.string(),
        school: z.string(),
      }),
    )
    .default([]),

  projects: z
    .array(
      z.object({
        name: z.string(),
        description: z.string(),
        url: z.string(),
        tech: z.array(z.string()),
      }),
    )
    .default([]),

  pdfUrl: z.string().optional(),
  previewUrl: z.string().optional(),
  cloudinaryPublicId: z.string().optional(),
});

export const CVExtractionSchema = CVSchema.extend({
  seniority_level: z.string().default('unknown'),
});

export type CVSchemaData = z.infer<typeof CVSchema>;
export type JobSchemaData = z.infer<typeof JobSchema>;
