import { z } from 'zod';

import { ApplicationStatusSchema } from '../common/status.schemas';
import { ApplicationSchema } from './application.schemas';

// Requests
export const CreateApplicationRequestSchema = z.object({
  cvId: z.string().regex(/^[a-f\d]{24}$/i, { message: 'cvId must be a valid MongoDB ObjectId.' }),
  jobId: z.string().regex(/^[a-f\d]{24}$/i, { message: 'jobId must be a valid MongoDB ObjectId.' }),
});

export type CreateApplicationRequest = z.infer<typeof CreateApplicationRequestSchema>;

export const UpdateApplicationStatusRequestSchema = z.object({
  status: ApplicationStatusSchema,
});

export type UpdateApplicationStatusRequest = z.infer<typeof UpdateApplicationStatusRequestSchema>;

// Response
export const ApplicationResponseSchema = z.object({
  application: ApplicationSchema,
});

export type ApplicationResponse = z.infer<typeof ApplicationResponseSchema>;

export const ApplicationListResponseSchema = z.object({
  applications: z.array(ApplicationSchema),
});

export type ApplicationListResponse = z.infer<typeof ApplicationListResponseSchema>;
