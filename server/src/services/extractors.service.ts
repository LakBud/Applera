import { cachedLLM, callLLM } from "./llm/llm.service.js";
import { EXTRACT_CV_PROMPT } from "../prompts/extractCVPrompt.js";
import { EXTRACT_JOB_PROMPT } from "../prompts/extractJobPrompt.js";
import { hash } from "../lib/hash.js";
import { CVSchema, CVSchemaData, JobSchema, JobSchemaData } from "../types/schemas/schema.js";

import { repairCV } from "./repair/cvRepair.service.js";
import { repairJob } from "./repair/jobRepair.service.js";
import { sanitise } from "../utils/extractors.utils.js";

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
export async function extractCVData(cvText: string): Promise<CVSchemaData> {
  const safeText = sanitise(cvText, "cvText");

  return cachedLLM<CVSchemaData>({
    cacheKey: `cv:${hash(safeText)}`,
    ttl: 60 * 60 * 24,

    fn: async () => {
      const result = await callLLM({
        systemPrompt: EXTRACT_CV_PROMPT,
        userContent: safeText,
        temperature: 0.2,
      });

      const parsed = CVSchema.safeParse(result);

      if (!parsed.success) {
        console.error("[CV VALIDATION ERROR]", parsed.error.issues);
        throw new Error("[CV] Invalid LLM output shape");
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
  const safeText = sanitise(jobText, "jobText");

  return cachedLLM<JobSchemaData>({
    cacheKey: `job:${hash(safeText)}`,
    ttl: 60 * 60 * 24,

    fn: async () => {
      const result = await callLLM({
        systemPrompt: EXTRACT_JOB_PROMPT,
        userContent: safeText,
        temperature: 0.2,
      });

      const parsed = JobSchema.safeParse(result);

      if (!parsed.success) {
        console.error("[JOB VALIDATION ERROR]", parsed.error.issues);
        throw new Error("[JOB] Invalid LLM output shape");
      }

      const cleaned = repairJob(parsed.data);

      return cleaned;
    },
  });
}
