import { CACHE_VERSIONS } from '../config/cache.versions.js';
import { EXTRACT_CV_PROMPT } from '../prompts/extract/extractCVPrompt.js';
import { EXTRACT_JOB_PROMPT } from '../prompts/extract/extractJobPrompt.js';
import { CVExtractionSchema, JobExtractionSchema } from '../types/schemas/extractor.schemas.js';
import { hash } from '../utils/shared/hash.utils.js';
import { sanitise } from '../utils/shared/sanitize.utils.js';
import { repairCV } from './cv/cvRepair.service.js';
import { repairJob } from './job/jobRepair.service.js';
import { cachedLLM, callLLM } from './llm/llm.service.js';

import type { CVParsed, JobParsed } from '@applera/schemas';

// ─────────────────────────────────────────────────────────────
// CV extractor
// ─────────────────────────────────────────────────────────────

/**
 * Flow:
 * 1. Sanitise raw text
 * 2. Check cache
 * 3. Call LLM
 * 4. Validate schema
 * 5. Repair/normalize structured output
 */
export async function extractCVData(
  cvText: string,
  { signal }: { signal?: AbortSignal } = {},
): Promise<CVParsed> {
  const safeText = sanitise(cvText, 'cvText');

  return cachedLLM<CVParsed>({
    cacheKey: `cv:${CACHE_VERSIONS.cv}:${hash(safeText)}`,
    ttl: 60 * 60 * 24,

    fn: async () => {
      const result = await callLLM({
        systemPrompt: EXTRACT_CV_PROMPT,
        userContent: safeText,
        temperature: 0.2,
        maxTokens: 800,
        signal,
      });

      const parsed = CVExtractionSchema.safeParse(result);

      if (!parsed.success) {
        console.error('[CV VALIDATION ERROR]', parsed.error.issues);
        throw new Error('[CV] Invalid LLM output shape');
      }

      const cleaned = repairCV(parsed.data);

      return cleaned;
    },
  });
}
// ─────────────────────────────────────────────────────────────
// Job extractor
// ─────────────────────────────────────────────────────────────

/**
 * Flow:
 * 1. Sanitise raw text
 * 2. Check cache
 * 3. Call LLM
 * 4. Validate schema
 * 5. Repair/normalize structured output
 */
export async function extractJobData(
  jobText: string,
  { signal }: { signal?: AbortSignal } = {},
): Promise<JobParsed> {
  const safeText = sanitise(jobText, 'jobText');

  return cachedLLM<JobParsed>({
    cacheKey: `job:${CACHE_VERSIONS.job}:${hash(safeText)}`,
    ttl: 60 * 60 * 24,

    fn: async () => {
      const result = await callLLM({
        systemPrompt: EXTRACT_JOB_PROMPT,
        userContent: safeText,
        temperature: 0.2,
        maxTokens: 800,
        signal,
      });

      const parsed = JobExtractionSchema.safeParse(result);

      if (!parsed.success) {
        console.error('[JOB VALIDATION ERROR]', parsed.error.format());
        throw new Error('[JOB] Invalid LLM output shape');
      }

      const cleaned = repairJob(parsed.data);

      return cleaned;
    },
  });
}
