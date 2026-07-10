import { CACHE_VERSIONS } from '../../config/cache.versions.js';
import { APP_GEN_PROMPT } from '../../prompts/application/applicationGen.system.js';
import { buildApplicationPrompt } from '../../prompts/application/applicationGen.user.js';
import {
  type ApplicationLLMOutput,
  ApplicationLLMSchema,
} from '../../types/schemas/llm.schemas.js';
import { buildCacheKey, scrubPlaceholders } from '../../utils/application/application.utils.js';
import { cachedLLM, callLLM } from '../llm/llm.service.js';

import type { MatchReport } from '../../types/schemas/match.schemas.js';
import type { CVParsed, JobParsed } from '@applera/schemas';

export async function generateApplication(
  cv: CVParsed,
  job: JobParsed,
  rawText: string,
  match: MatchReport,
): Promise<ApplicationLLMOutput> {
  const cacheKey = buildCacheKey(CACHE_VERSIONS.application, cv, job, rawText, match);

  const raw = await cachedLLM({
    cacheKey,
    ttl: 60 * 60 * 24 * 7, // 7 days
    fn: async () => {
      return callLLM({
        systemPrompt: APP_GEN_PROMPT,
        userContent: buildApplicationPrompt(cv, job, rawText, match),
        temperature: 0.3,
        jsonMode: true,
        maxTokens: 1500,
      });
    },
  });

  const cleaned = scrubPlaceholders(raw);

  // ZOD VALIDATION
  const parsed = ApplicationLLMSchema.safeParse(cleaned);

  if (!parsed.success) {
    console.error('[generateApplication INVALID OUTPUT]', parsed.error);
    throw new Error('[generateApplication] Invalid LLM output schema');
  }

  return parsed.data;
}
