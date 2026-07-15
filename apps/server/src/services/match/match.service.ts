import { CACHE_VERSIONS } from '../../config/cache.versions.js';
import { runAIEnrichment } from '../../lib/match/ai.match.js';
import { runMathMatch } from '../../lib/match/math.match.js';
import { type MatchReport, MatchReportSchema } from '../../types/schemas/match.schemas.js';
import { normalizeSkill } from '../../utils/match/skills/skill.utils.js';
import { extractAllText } from '../../utils/match/text.utils.js';
import { hash } from '../../utils/shared/hash.utils.js';
import { cachedLLM } from '../llm/llm.service.js';

import type { LLMExecutionOptions } from '../../types/llm.types.js';
import type { CVParsed, JobParsed } from '@applera/schemas';

export interface MatchOptions extends LLMExecutionOptions {
  skipAI?: boolean;
}

export async function matchCVToJob(
  cv: CVParsed,
  job: JobParsed,
  { skipAI = false, signal, reserveUsage, refundUsage }: MatchOptions = {},
): Promise<MatchReport> {
  const cacheKey = `match:${CACHE_VERSIONS.match}:${hash(
    JSON.stringify({
      cvSkills: cv.skills,
      jobSkills: job.required_skills,
      cvText: extractAllText(cv),
      jobText: extractAllText(job),
      skipAI,
    }),
  )}`;

  return cachedLLM({
    cacheKey,
    ttl: 60 * 60 * 24,

    fn: async () => {
      const mathResult = runMathMatch(cv, job);

      const needsAI = !skipAI && (mathResult.confidence === 'low' || mathResult.score <= 75);

      signal?.throwIfAborted();

      const ai_insights = needsAI
        ? await runAIEnrichment(cv, job, mathResult, {
            signal,
            reserveUsage,
            refundUsage,
          })
        : null;

      const coveredByAI = new Set(
        [...(ai_insights?.semantic_matches ?? []), ...(ai_insights?.implicit_skills ?? [])].map(
          normalizeSkill,
        ),
      );

      const adjustedScore =
        ai_insights?.adjusted_score !== undefined &&
        Math.abs(ai_insights.adjusted_score - mathResult.score) <= 40
          ? ai_insights.adjusted_score
          : mathResult.score;

      const result: MatchReport = {
        ...mathResult,
        score: adjustedScore,
        seniority_fit: ai_insights?.seniority_fit ?? mathResult.seniority_fit,
        domain_mismatch: ai_insights?.domain_mismatch ?? mathResult.domain_mismatch,
        confidence: ai_insights?.confidence ?? mathResult.confidence,
        strengths: [
          ...mathResult.strengths,
          ...mathResult.missing_skills.filter((s) => coveredByAI.has(normalizeSkill(s))),
        ],
        missing_skills: mathResult.missing_skills.filter(
          (s) => !coveredByAI.has(normalizeSkill(s)),
        ),
        ai_insights,
      };

      return MatchReportSchema.parse(result);
    },
  });
}
