// Generates the final application text from structured CV + job + match data.
// Retry logic is handled inside lib/llm.js

import { callLLM } from "../lib/llm.js";
import { APP_GEN_PROMPT } from "../prompts/applicationGenPrompt.js";

// ── Placeholder scrubber ──────────────────────────────────────────────────────
// The LLM sometimes inserts [company], [name], [x] even when told not to.
// Strip them in code so they never reach the DB or the user.

function scrubPlaceholders(obj) {
  if (typeof obj === "string") {
    return obj
      .replace(/\[.*?\]/g, "") // remove [company], [name], [x], etc.
      .replace(/\s{2,}/g, " ") // collapse double spaces left behind
      .trim();
  }
  if (Array.isArray(obj)) return obj.map(scrubPlaceholders);
  if (obj && typeof obj === "object") {
    return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, scrubPlaceholders(v)]));
  }
  return obj;
}

/**
 * @param {object} cv     Structured CV from extractCVData
 * @param {object} job    Structured job from extractJobData
 * @param {object} match  Match report from matchCVToJob
 * @returns {Promise<object>} { cv_summary, application_letter, email_template }
 */

export async function generateApplication(cv, job, match) {
  for (const [label, val] of [
    ["cv", cv],
    ["job", job],
    ["match", match],
  ]) {
    if (!val || typeof val !== "object") {
      throw new TypeError(`[applicationService] "${label}" must be a plain object`);
    }
  }

  return callLLM({
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
    maxTokens: 4000, // cover letter + email + summary needs more room than the default 2000
  });
}
