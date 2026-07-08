import { JobDocumentSchema } from '@applera/schemas';
import { z } from 'zod';

export const CreateJobResponseSchema = z.object({
  message: z.string(),
  job: JobDocumentSchema,
});

export type CreateJobResponse = z.infer<typeof CreateJobResponseSchema>;
