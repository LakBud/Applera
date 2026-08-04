import { CACHE_VERSIONS } from '../../config/cache.versions.js';
import { APP_GEN_PROMPT } from '../../prompts/application/applicationGen.system.js';
import { buildApplicationPrompt } from '../../prompts/application/applicationGen.user.js';
import {
  type ApplicationLLMOutput,
  ApplicationLLMSchema,
} from '../../types/schemas/application.schemas.js';
import { buildCacheKey, scrubPlaceholders } from '../../utils/application/application.utils.js';
import { llm } from '../llm/llm.service.js';

import type { LLMExecutionOptions } from '../../types/llm.types.js';
import type { MatchReport } from '../../types/schemas/match.schemas.js';
import type { CVParsed, JobParsed } from '@applera/schemas';

export async function generateApplication(
  cv: CVParsed,
  job: JobParsed,
  rawText: string,
  match: MatchReport,
  { signal, reserveUsage, refundUsage }: LLMExecutionOptions = {},
): Promise<ApplicationLLMOutput> {
  const cacheKey = buildCacheKey(CACHE_VERSIONS.application, cv, job, rawText, match);

  return llm.cachedCall<ApplicationLLMOutput>({
    cacheKey,
    ttl: 60 * 60 * 24 * 7, // 7 days
    signal,
    reserveUsage,
    refundUsage,

    fn: async (): Promise<ApplicationLLMOutput> => {
      const result = await llm.call<ApplicationLLMOutput>({
        systemPrompt: APP_GEN_PROMPT,
        userContent: buildApplicationPrompt(cv, job, rawText, match),
        temperature: 0.3,
        jsonMode: true,
        maxTokens: 1500,
        signal,
        schema: ApplicationLLMSchema,
      });

      return scrubPlaceholders(result);
    },
  });
}
