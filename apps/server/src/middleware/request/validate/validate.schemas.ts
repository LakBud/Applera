import { z } from 'zod';

const textField = (label: string, max = 20_000, min = 10) =>
  z
    .string()
    .trim()
    .nonempty({ message: `${label} is required.` })
    .min(min, { message: `${label} is too short.` })
    .max(max, { message: `${label} exceeds limit.` });

export const schemas = {
  createApplication: z.object({
    cvId: z.string().min(1),
    jobId: z.string().min(1),
  }),
  createJob: z.object({
    jobText: textField('jobText').optional(),
  }),
  uploadCV: z.object({
    cvText: textField('cvText').optional(),
  }),
} as const;

export type SchemaName = keyof typeof schemas;
