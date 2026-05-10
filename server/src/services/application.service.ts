import { APP_GEN_PROMPT } from "../prompts/applicationGenPrompt.js";
import { cachedLLM, callLLM } from "../lib/llm.js";
import type { CVData, JobData } from "../types/types.js";
import type { ApplicationLLMOutput, MatchData } from "../types/application.types.js";
import { buildCacheKey, isApplicationLLMOutput, scrubPlaceholders } from "../utils/application.utils.js";

// ── Main function ───────────────────────────────────────────────────────

/**
 * Generates a full job application using LLM with caching.
 * Expensive operation → cached by CV + Job + Match hash.
 */
export async function generateApplication(cv: CVData, job: JobData, match: MatchData): Promise<ApplicationLLMOutput> {
  for (const [label, val] of [
    ["cv", cv],
    ["job", job],
    ["match", match],
  ] as const) {
    if (!val || typeof val !== "object" || Array.isArray(val)) {
      throw new TypeError(`[applicationService] "${label}" must be a plain object`);
    }
  }

  const cacheKey = buildCacheKey(cv, job, match);

  const raw = await cachedLLM({
    cacheKey,
    ttl: 60 * 60 * 24 * 7, // 7 days
    fn: async () => {
      return await callLLM({
        systemPrompt: APP_GEN_PROMPT,
        userContent: [
          "CV:",
          JSON.stringify(cv, null, 2),
          "",
          "JOB:",
          JSON.stringify(job, null, 2),
          "",
          "MATCH (DO NOT RECOMPUTE):",
          JSON.stringify(match, null, 2),
          "",
          "TASK:",
          "Generate the structured job application JSON.",
        ].join("\n"),
        temperature: 0.3,
        jsonMode: true,
        maxTokens: 4000,
      });
    },
  });

  const cleaned = scrubPlaceholders(raw);

  if (!isApplicationLLMOutput(cleaned)) {
    console.error("[LLM INVALID OUTPUT]", cleaned);

    throw new Error(`[LLM] Invalid ApplicationLLMOutput shape: ${JSON.stringify(cleaned, null, 2)}`);
  }

  return cleaned;
}
