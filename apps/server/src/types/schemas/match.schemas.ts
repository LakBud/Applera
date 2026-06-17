import { z } from 'zod';

export const MatchReportSchema = z.object({
  score: z.number().min(0).max(100),
  strengths: z.array(z.string()),
  missing_skills: z.array(z.string()),
  seniority_fit: z.enum(['under', 'over', 'match']),
  domain_mismatch: z.boolean(),
  confidence: z.enum(['low', 'medium', 'high']),
  text_overlap: z.number(),
  recommendation: z.string(),
  ai_insights: z
    .object({
      semantic_matches: z.array(z.string()), // skills math missed, AI found
      implicit_skills: z.array(z.string()), // found in prose, not skill list
      reasoning: z.string(), // why the AI scored it this way
      adjusted_score: z.number().min(0).max(100),
    })
    .nullable(),
});

export type ConfidenceLevel = z.infer<typeof MatchReportSchema>['confidence'];
export type MatchReport = z.infer<typeof MatchReportSchema>;
