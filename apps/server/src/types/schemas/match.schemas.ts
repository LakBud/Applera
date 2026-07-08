import { ConfidenceSchema, MatchSchema, SeniorityFitSchema } from '@applera/schemas';
import { z } from 'zod';

export const MatchReportSchema = MatchSchema.extend({
  text_overlap: z.number(),
  ai_insights: z
    .object({
      semantic_matches: z.array(z.string()),
      implicit_skills: z.array(z.string()),
      reasoning: z.string(),
      adjusted_score: z.number().min(0).max(100),
      seniority_fit: SeniorityFitSchema.nullable(),
      domain_mismatch: z.boolean().nullable(),
      confidence: ConfidenceSchema.nullable(),
    })
    .nullable(),
});

export type MatchReport = z.infer<typeof MatchReportSchema>;
