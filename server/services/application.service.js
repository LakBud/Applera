// Generates the final application text from structured CV + job + match data.
// Retry logic is handled inside lib/llm.js

import { callLLM } from "../lib/llm.js";
import { APP_GEN_PROMPT } from "../prompts/applicationGenPrompt.js";

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
  });
}
