import { z } from 'zod';

export const InterviewPrepParsedSchema = z.object({
  questions: z.array(
    z.object({
      category: z.string(),
      question: z.string(),
      tip: z.string(),
    }),
  ),
  general_tips: z.array(z.string()),
});

export type InterviewPrepParsed = z.infer<typeof InterviewPrepParsedSchema>;

export const InterviewPrepSchema = z.object({
  _id: z.string(),

  application: z.string(),

  parsed: InterviewPrepParsedSchema,

  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type InterviewPrep = z.infer<typeof InterviewPrepSchema>;
