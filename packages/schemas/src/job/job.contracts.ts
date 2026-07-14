import { z } from 'zod';

import { JobDocumentSchema } from './job.schemas';

export const CreateJobResponseSchema = z.object({
  message: z.string(),
  job: JobDocumentSchema,
});

export type CreateJobResponse = z.infer<typeof CreateJobResponseSchema>;

export const JobListResponseSchema = z.array(JobDocumentSchema);

export type JobListResponse = z.infer<typeof JobListResponseSchema>;
