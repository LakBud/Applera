import { z } from 'zod';

const textField = (label: string, max = 20_000, min = 10) =>
  z
    .string()
    .trim()
    .nonempty({ message: `${label} is required.` })
    .min(min, { message: `${label} is too short.` })
    .max(max, { message: `${label} exceeds limit.` });

const objectId = (label: string) =>
  z.string().regex(/^[a-f\d]{24}$/i, { message: `${label} must be a valid MongoDB ObjectId.` });

export const requestSchemas = {
  createApplication: z.object({
    cvId: objectId('cvId'),
    jobId: objectId('jobId'),
  }),
  createJob: z.object({
    jobText: textField('jobText').optional(),
  }),
  uploadCV: z.object({
    cvText: textField('cvText').optional(),
  }),
} as const;

export type requestSchemaName = keyof typeof requestSchemas;
