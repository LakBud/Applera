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
    body: z.object({
      cvId: objectId('cvId'),
      jobId: objectId('jobId'),
    }),
    params: z.object({}),
    query: z.object({}),
  }),

  createJob: z.object({
    body: z.object({
      jobText: textField('jobText').optional(),
    }),
    params: z.object({}),
    query: z.object({}),
  }),

  uploadCV: z.object({
    body: z.object({
      cvText: textField('cvText').optional(),
    }),
    params: z.object({}),
    query: z.object({}),
  }),

  generatePrep: z.object({
    body: z.object({}),
    params: z.object({
      applicationId: objectId('applicationId'),
    }),
    query: z.object({}),
  }),
} as const;

export type requestSchemaName = keyof typeof requestSchemas;
