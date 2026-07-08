import { InterviewPrepSchema } from '@applera/schemas';
import { z } from 'zod';

export const InterviewPrepResponseSchema = z.object({
  prep: InterviewPrepSchema,
});
