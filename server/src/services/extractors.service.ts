import { cachedLLM, callLLM } from "../lib/llm.js";
import { EXTRACT_CV_PROMPT } from "../prompts/extractCVPrompt.js";
import { EXTRACT_JOB_PROMPT } from "../prompts/extractJobPrompt.js";
import { hash } from "../lib/hash.js";
import { CVSchema, JobSchema, type CVSchemaData, type JobSchemaData } from "../types/extractors.schema.js";

import { repairCV } from "./repair/cvRepair.service.js";
import { repairJob } from "./repair/jobRepair.service.js";

const MAX_INPUT_LENGTH = 20_000;

// ─────────────────────────────────────────────────────────────
// Injection detection
// ─────────────────────────────────────────────────────────────

const INJECTION_PATTERNS = [
  /ignore (all |previous |the |above )?instructions?/i,
  /disregard (all |previous |the |above )?instructions?/i,
  /you are now/i,
  /new persona/i,
  /forget (everything|all|your instructions)/i,
  /system\s*:/i,
  /<\s*system\s*>/i,
];

function detectInjection(text: string): boolean {
  return INJECTION_PATTERNS.some((pattern) => pattern.test(text));
}

// ─────────────────────────────────────────────────────────────
// Input sanitization
// ─────────────────────────────────────────────────────────────

function sanitise(text: string, label: string): string {
  if (typeof text !== "string" || !text.trim()) {
    throw new TypeError(`[extractors] "${label}" must be non-empty`);
  }

  if (text.length > MAX_INPUT_LENGTH) {
    throw new Error(`[extractors] "${label}" too large`);
  }

  if (detectInjection(text)) {
    throw new Error(`[extractors] "${label}" blocked (injection detected)`);
  }

  return text.trim();
}

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

      return repairCV(parsed.data);
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

      return repairJob(parsed.data);
    },
  });
}
