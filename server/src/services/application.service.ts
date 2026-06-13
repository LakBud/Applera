import type { z } from 'zod';

import { APP_GEN_PROMPT } from '../prompts/application/applicationGen.system.js';
import { buildApplicationPrompt } from '../prompts/application/applicationGen.user.js';
import type { MatchReport } from '../types/match.types.js';
import { ApplicationLLMSchema } from '../types/schemas/llm.schemas.js';
import type { CVSchema, JobSchema } from '../types/schemas/schema.js';
import { buildCacheKey, scrubPlaceholders } from '../utils/application.utils.js';
import { CACHE_VERSIONS } from '../utils/cache.versions.js';
import { cachedLLM, callLLM } from './llm/llm.service.js';

export type CVSchemaData = z.infer<typeof CVSchema>;
export type JobSchemaData = z.infer<typeof JobSchema>;
export type ApplicationLLMOutput = z.infer<typeof ApplicationLLMSchema>;

export async function generateApplication(
  cv: CVSchemaData,
  job: JobSchemaData,
  match: MatchReport,
): Promise<ApplicationLLMOutput> {
  const cacheKey = buildCacheKey(CACHE_VERSIONS.application, cv, job, match);

  const raw = await cachedLLM({
    cacheKey,
    ttl: 60 * 60 * 24 * 7, // 7 days
    fn: async () => {
      return callLLM({
        systemPrompt: APP_GEN_PROMPT,
        userContent: buildApplicationPrompt(cv, job, match),
        temperature: 0.3,
        jsonMode: true,
        maxTokens: 1500,
      });
    },
  });

  const cleaned = scrubPlaceholders(raw);

  // ── ZOD VALIDATION (source of truth) ─────────────────────────────
  const parsed = ApplicationLLMSchema.safeParse(cleaned);

  if (!parsed.success) {
    console.error('[generateApplication INVALID OUTPUT]', parsed.error.flatten());
    throw new Error('[generateApplication] Invalid LLM output schema');
  }

  return parsed.data;
}
