import { APP_GEN_PROMPT } from "../prompts/applicationGenPrompt.js";

import { buildCacheKey } from "../utils/application.utils.js";
import { scrubPlaceholders } from "../utils/application.utils.js";

import type { z } from "zod";
import type { CVSchema, JobSchema } from "../types/schemas/schema.js";
import type { MatchReport } from "../types/match.types.js";
import { ApplicationLLMSchema } from "../types/schemas/llm.schemas.js";
import { cachedLLM, callLLM } from "./llm/llm.service.js";

export type CVSchemaData = z.infer<typeof CVSchema>;
export type JobSchemaData = z.infer<typeof JobSchema>;
export type ApplicationLLMOutput = z.infer<typeof ApplicationLLMSchema>;

function buildPrompt(cv: CVSchemaData, job: JobSchemaData, match: MatchReport): string {
  return `
CV:
${JSON.stringify(cv, null, 2)}

JOB:
${JSON.stringify(job, null, 2)}

MATCH (DO NOT RECOMPUTE):
${JSON.stringify(match, null, 2)}

TASK:
Generate a structured job application JSON strictly following the schema.
`.trim();
}

export async function generateApplication(
  cv: CVSchemaData,
  job: JobSchemaData,
  match: MatchReport,
): Promise<ApplicationLLMOutput> {
  const cacheKey = buildCacheKey(cv, job, match);

  const raw = await cachedLLM({
    cacheKey,
    ttl: 60 * 60 * 24 * 7, // 7 days
    fn: async () => {
      return callLLM({
        systemPrompt: APP_GEN_PROMPT,
        userContent: buildPrompt(cv, job, match),
        temperature: 0.3,
        jsonMode: true,
        maxTokens: 4000,
      });
    },
  });

  const cleaned = scrubPlaceholders(raw);

  // ── ZOD VALIDATION (source of truth) ─────────────────────────────
  const parsed = ApplicationLLMSchema.safeParse(cleaned);

  if (!parsed.success) {
    console.error("[generateApplication INVALID OUTPUT]", parsed.error.flatten());
    throw new Error("[generateApplication] Invalid LLM output schema");
  }

  return parsed.data;
}
