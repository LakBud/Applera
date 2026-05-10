import { hash } from "../lib/hash.js";
import { ApplicationLLMOutput, MatchData } from "../types/application.types.js";
import { CVData, JobData } from "../types/types.js";

// ── Cache key builder ───────────────────────────────────────────────────

export function buildCacheKey(cv: CVData, job: JobData, match: MatchData): string {
  return `application:${hash(
    JSON.stringify({
      cv,
      job,
      match,
    }),
  )}`;
}

// ── Placeholder scrubber ───────────────────────────────────────────────

export function scrubPlaceholders(value: unknown): unknown {
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

export function isApplicationLLMOutput(value: any): value is ApplicationLLMOutput {
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
