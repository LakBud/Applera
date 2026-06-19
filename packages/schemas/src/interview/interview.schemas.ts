import { z } from 'zod';

export const InterviewPrepSchema = z.object({
  _id: z.string(),

  application: z.string(),

  questions: z.array(
    z.object({
      category: z.string(),
      question: z.string(),
      tip: z.string(),
    }),
  ),

  general_tips: z.array(z.string()),

  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type InterviewPrep = z.infer<typeof InterviewPrepSchema>;
