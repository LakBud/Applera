// ── AI pass ───────────────────────────────────────────────────────────────────

import { CVSchemaData, JobSchemaData } from '../../controllers/interviewPrep.controller.js';
import { buildMatchEnrichPrompt } from '../../prompts/matchEnrichPrompt.js';
import { cachedLLM, callLLM } from '../../services/llm/llm.service.js';
import { MatchReport, MatchReportSchema } from '../../types/schemas/match.schemas.js';
import { CACHE_VERSIONS } from '../../utils/cache.versions.js';
import { extractAllText } from '../../utils/match.utils.js';
import { hash } from '../hash.js';

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
