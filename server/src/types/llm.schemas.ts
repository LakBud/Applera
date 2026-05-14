import { z } from "zod";

// ─────────────────────────────────────────────
// Match schema
// ─────────────────────────────────────────────

export const MatchReportSchema = z.object({
  score: z.number(),

  confidence: z.enum(["low", "medium", "high"]),

  strengths: z.array(z.string()),
  missing_skills: z.array(z.string()),

  matched_keywords: z.array(z.string()).optional(),
  explanation: z.string().optional(),

  seniority_fit: z.enum(["under", "over", "match"]),
  domain_mismatch: z.boolean(),
  text_overlap: z.number(),

  recommendation: z.string(),
});

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
