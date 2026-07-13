import { z } from 'zod';

import { InterviewPrepSchema } from './interview.schemas';

export const InterviewPrepResponseSchema = z.object({
  prep: InterviewPrepSchema,
});
