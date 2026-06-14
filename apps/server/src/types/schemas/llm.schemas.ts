import { z } from 'zod';

// ─────────────────────────────────────────────
// Application LLM schema
// ─────────────────────────────────────────────

export const ApplicationLLMSchema = z.object({
  cv_summary: z.string(),

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
