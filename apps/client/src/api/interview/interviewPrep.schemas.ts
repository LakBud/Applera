import { InterviewPrepSchema } from '@repo/schemas';
import { z } from 'zod';

export const InterviewPrepResponseSchema = z.object({
  prep: InterviewPrepSchema,
});
