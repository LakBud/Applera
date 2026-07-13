import { z } from 'zod';

import { ConfidenceSchema } from '../common/confidence.schema';
import { SENIORITY_FIT_VALUES } from '../types/seniority.types';

export const SeniorityFitSchema = z.enum(SENIORITY_FIT_VALUES);

export type SeniorityFit = z.infer<typeof SeniorityFitSchema>;

export const MatchSchema = z.object({
  score: z.number().int().min(0).max(100),
  confidence: ConfidenceSchema,
  strengths: z.array(z.string()),
  missing_skills: z.array(z.string()),
  seniority_fit: SeniorityFitSchema,
  domain_mismatch: z.boolean(),
  recommendation: z.string(),
});

export type Match = z.infer<typeof MatchSchema>;
