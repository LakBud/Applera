import { APP_GEN_PROMPT } from "../prompts/applicationGenPrompt.js";
import { cachedLLM, callLLM } from "../lib/llm.js";
import { hash } from "../lib/hash.js";
import type { CVData, JobData } from "../types/extractors.types.js";
import type { MatchData } from "../types/application.types.ts";

// ── Types ───────────────────────────────────────────────────────────────

export type ApplicationLLMOutput = {
  cv_summary: string;
  application_letter: {
    introduction?: string;
    body?: string;
    closing?: string;
  };
  email_template: {
    subject: string;
    body: string;
  };
};

export type Application = {
  cv: string;
  job: string;

  match: {
    score: number;
    confidence: string;
    strengths: string[];
    missing_skills: string[];
  };

  tailored_cv_summary: string;
  cover_letter: string;

  application_email: {
    subject: string;
    body: string;
  };
};

export type ApplicationCreateInput = {
  cv: any;
  job: any;
  match: any;

  tailored_cv_summary: string;
  cover_letter: string;

  application_email: {
    subject: string;
    body: string;
  };
};

// ── Cache key builder ───────────────────────────────────────────────────

function buildCacheKey(cv: CVData, job: JobData, match: MatchData): string {
  return `application:${hash(
    JSON.stringify({
      cv,
      job,
      match,
    }),
  )}`;
}

// ── Placeholder scrubber ───────────────────────────────────────────────

function scrubPlaceholders(value: unknown): unknown {
  if (typeof value === "string") {
    return value
      .replace(/\[.*?\]/g, "")
      .replace(/\s{2,}/g, " ")
      .trim();
  }

  if (Array.isArray(value)) {
    return value.map(scrubPlaceholders);
  }

  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = scrubPlaceholders(v);
    }
    return out;
  }

  return value;
}

// ── Runtime guard ──────────────────────────────────────────────────────

function isApplicationLLMOutput(value: any): value is ApplicationLLMOutput {
  return (
    value &&
    typeof value === "object" &&
    typeof value.cv_summary === "string" &&
    value.application_letter &&
    typeof value.application_letter.introduction === "string" &&
    typeof value.application_letter.body === "string" &&
    typeof value.application_letter.closing === "string" &&
    value.email_template &&
    typeof value.email_template.subject === "string" &&
    typeof value.email_template.body === "string"
  );
}

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
