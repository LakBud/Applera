import { callLLM } from "../lib/llm.js";
import { EXTRACT_CV_PROMPT } from "../prompts/extractCVPrompt.js";
import { EXTRACT_JOB_PROMPT } from "../prompts/extractJobPrompt.js";

const MAX_INPUT_LENGTH = 20_000;

function sanitise(text, label) {
  if (typeof text !== "string" || !text.trim()) {
    throw new TypeError(`[extractors] "${label}" must be a non-empty string`);
  }
  if (text.length > MAX_INPUT_LENGTH) {
    throw new Error(`[extractors] "${label}" exceeds ${MAX_INPUT_LENGTH} character limit`);
  }
  return text.trim();
}

/**
 * Extracts structured data from raw CV text.
 * @param {string} cvText  Plain text extracted from the CV PDF
 * @returns {Promise<object>} Structured CV object
 */
export async function extractCVData(cvText) {
  return callLLM({
    systemPrompt: EXTRACT_CV_PROMPT,
    userContent: sanitise(cvText, "cvText"),
    temperature: 0.2,
  });
}

/**
 * Extracts structured data from a job listing (raw text or PDF text).
 * @param {string} jobText  Plain text of the job description
 * @returns {Promise<object>} Structured job object
 */
export async function extractJobData(jobText) {
  return callLLM({
    systemPrompt: EXTRACT_JOB_PROMPT,
    userContent: sanitise(jobText, "jobText"),
    temperature: 0.2,
  });
}
