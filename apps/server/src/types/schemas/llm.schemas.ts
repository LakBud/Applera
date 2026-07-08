import { z } from 'zod';

export const ApplicationLLMSchema = z.object({
  tailoring_advice: z.string(),

  application_letter: z.object({
    introduction: z.string().optional(),
    body: z.string().optional(),
    closing: z.string().optional(),
  }),

  email_template: z.object({
    subject: z.string(),
    body: z.string(),
  }),
});

export type ApplicationLLMOutput = z.infer<typeof ApplicationLLMSchema>;
