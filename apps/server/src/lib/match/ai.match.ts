import { CACHE_VERSIONS } from '../../config/cache.versions.js';
import { buildMatchEnrichPrompt } from '../../prompts/matchEnrichPrompt.js';
import { cachedLLM, callLLM } from '../../services/llm/llm.service.js';
import { MatchReport, MatchReportSchema } from '../../types/schemas/match.schemas.js';
import { CVSchemaData, JobSchemaData } from '../../types/schemas/schema.js';
import { extractAllText } from '../../utils/match/match.utils.js';
import { hash } from '../../utils/shared/hash.utils.js';

// ── AI pass ───────────────────────────────────────────────────────────────────

export async function runAIEnrichment(
  cv: CVSchemaData,
  job: JobSchemaData,
  mathResult: Omit<MatchReport, 'ai_insights'>,
): Promise<MatchReport['ai_insights']> {
  const cacheKey = `match:ai:${CACHE_VERSIONS.match}:${hash(
    JSON.stringify({
      cvSkills: cv.skills,
      jobSkills: job.required_skills,
      cvText: extractAllText(cv),
      jobText: extractAllText(job),
    }),
  )}`;

  const { systemPrompt, userContent } = buildMatchEnrichPrompt(cv, job, mathResult);

  return cachedLLM({
    cacheKey,
    ttl: 60 * 60 * 24,
    fn: async () => {
      const raw = await callLLM({
        jsonMode: true,
        maxTokens: 600,
        temperature: 0.1,
        systemPrompt,
        userContent,
      });

      const parsed = MatchReportSchema.shape.ai_insights.parse(raw);
      return parsed;
    },
  });
}
