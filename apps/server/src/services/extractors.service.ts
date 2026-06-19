import { CVExtractionSchema, type CVParsed } from '@repo/schemas';

import { CACHE_VERSIONS } from '../config/cache.versions.js';
import { EXTRACT_CV_PROMPT } from '../prompts/extract/extractCVPrompt.js';
import { EXTRACT_JOB_PROMPT } from '../prompts/extract/extractJobPrompt.js';
import { JobExtractionSchema, type JobSchemaData } from '../types/schemas/schema.js';
import { hash } from '../utils/shared/hash.utils.js';
import { sanitise } from '../utils/shared/sanitize.utils.js';
import { repairCV } from './cv/cvRepair.service.js';
import { repairJob } from './job/jobRepair.service.js';
import { cachedLLM, callLLM } from './llm/llm.service.js';

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
export async function extractCVData(cvText: string): Promise<CVParsed> {
  const safeText = sanitise(cvText, 'cvText');

  return cachedLLM<CVParsed>({
    cacheKey: `cv:${CACHE_VERSIONS.cv}:${hash(safeText)}`,
    ttl: 60 * 60 * 24,

    fn: async () => {
      const result = await callLLM({
        systemPrompt: EXTRACT_CV_PROMPT,
        userContent: safeText,
        temperature: 0.2,
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
export async function extractJobData(jobText: string): Promise<JobSchemaData> {
  const safeText = sanitise(jobText, 'jobText');

  return cachedLLM<JobSchemaData>({
    cacheKey: `job:${CACHE_VERSIONS.job}:${hash(safeText)}`,
    ttl: 60 * 60 * 24,

    fn: async () => {
      const result = await callLLM({
        systemPrompt: EXTRACT_JOB_PROMPT,
        userContent: safeText,
        temperature: 0.2,
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
