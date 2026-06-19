import type { CVParsed, JobParsed } from '@repo/schemas';

import { CACHE_VERSIONS } from '../../config/cache.versions.js';
import { runAIEnrichment } from '../../lib/match/ai.match.js';
import { runMathMatch } from '../../lib/match/math.match.js';
import { type MatchReport, MatchReportSchema } from '../../types/schemas/match.schemas.js';
import { extractAllText } from '../../utils/match/match.utils.js';
import { hash } from '../../utils/shared/hash.utils.js';
import { cachedLLM } from '../llm/llm.service.js';

// ── Public API ─────────────────────────────────────────────────────────────────

export async function matchCVToJob(
  cv: CVParsed,
  job: JobParsed,
  { skipAI = false }: { skipAI?: boolean } = {},
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

      // only call AI for ambiguous or low-confidence results
      const needsAI =
        !skipAI &&
        (mathResult.confidence === 'low' || (mathResult.score >= 30 && mathResult.score <= 75));

      const ai_insights = needsAI ? await runAIEnrichment(cv, job, mathResult) : null;

      const result: MatchReport = { ...mathResult, ai_insights };

      return MatchReportSchema.parse(result); // validates the whole thing before caching
    },
  });
}
