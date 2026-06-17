import { z } from 'zod';

export const JobParsedSchema = z.object({
  title: z.string().optional(),
  company: z.string().optional(),
  required_skills: z.array(z.string()),
  responsibilities: z.array(z.string()),
  seniority: z.string().optional(),
  location: z.string().optional(),
  raw_description: z.string().optional(),
});

export const JobDocumentSchema = z.object({
  _id: z.string(),
  rawText: z.string().optional(),
  parsed: JobParsedSchema,

  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const CreateJobResponseSchema = z.object({
  message: z.string(),
  job: JobDocumentSchema,
});

export type JobDocument = z.infer<typeof JobDocumentSchema>;
export type CreateJobResponse = z.infer<typeof CreateJobResponseSchema>;
