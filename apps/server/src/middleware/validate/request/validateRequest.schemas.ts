import {
  CreateApplicationRequestSchema,
  UpdateApplicationStatusRequestSchema,
} from '@applera/schemas';
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

const idParamOnly = (key: string) =>
  z.object({
    body: z.object({}),
    params: z.object({
      [key]: objectId(key),
    }),
    query: z.object({}),
  });

export const requestSchemas = {
  createApplication: z.object({
    body: CreateApplicationRequestSchema,
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

  generatePrep: idParamOnly('applicationId'),

  // --- Non-POST routes ---
  // Note: getCVs, getApplications, getJobs are intentionally omitted here —
  // they take no params/query/body, so validate(...) is skipped on those
  // routes entirely and validateResponse(...) is relied on instead.

  getCVById: idParamOnly('id'),

  deleteCVById: idParamOnly('id'),

  pinCV: idParamOnly('id'),

  getCVDashboard: idParamOnly('cvId'),

  getApplicationById: idParamOnly('id'),

  updateApplicationStatus: z.object({
    body: UpdateApplicationStatusRequestSchema,
    params: z.object({
      id: objectId('id'),
    }),
    query: z.object({}),
  }),

  deleteApplication: idParamOnly('id'),

  getInterviewPrep: idParamOnly('applicationId'),

  getJobById: idParamOnly('id'),

  deleteJobById: idParamOnly('id'),
} as const;

export type requestSchemaName = keyof typeof requestSchemas;
