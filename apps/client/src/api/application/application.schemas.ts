import { ApplicationSchema, ApplicationStatusSchema } from '@repo/schemas';
import { z } from 'zod';

// Requests
export const CreateApplicationRequestSchema = z.object({
  cvId: z.string(),
  jobId: z.string(),
});

export type CreateApplicationRequest = z.infer<typeof CreateApplicationRequestSchema>;

export const UpdateApplicationStatusRequestSchema = z.object({
  status: ApplicationStatusSchema,
  notes: z.string().optional(),
});

export type UpdateApplicationStatusRequest = z.infer<typeof UpdateApplicationStatusRequestSchema>;

// Response
export const ApplicationResponseSchema = z.object({
  application: ApplicationSchema,
});

export const ApplicationsResponseSchema = z.object({
  applications: z.array(ApplicationSchema),
});

export type ApplicationResponse = z.infer<typeof ApplicationResponseSchema>;

export type ApplicationsResponse = z.infer<typeof ApplicationsResponseSchema>;
