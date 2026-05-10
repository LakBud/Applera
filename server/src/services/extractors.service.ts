import { callLLM } from "../lib/llm.js";
import { EXTRACT_CV_PROMPT } from "../prompts/extractCVPrompt.js";
import { EXTRACT_JOB_PROMPT } from "../prompts/extractJobPrompt.js";

const MAX_INPUT_LENGTH = 20_000;

// ── Prompt injection patterns ─────────────────────────────────────────────────
// Catches the most common injection attempts before the text reaches the LLM.
// Not foolproof — defence in depth means the system prompt is the primary
// guard, this is a secondary filter that catches obvious attacks cheaply.

const INJECTION_PATTERNS = [
  /ignore (all |previous |the |above )?instructions?/i,
  /disregard (all |previous |the |above )?instructions?/i,
  /you are now/i,
  /new persona/i,
  /forget (everything|all|your instructions)/i,
  /system\s*:/i,
  /<\s*system\s*>/i,
];

function detectInjection(text: string) {
  return INJECTION_PATTERNS.some((pattern) => pattern.test(text));
}

// ── Sanitise ──────────────────────────────────────────────────────────────────

function sanitise(text: string, label: string): string {
  if (typeof text !== "string" || !text.trim()) {
    throw new TypeError(`[extractors] "${label}" must be a non-empty string`);
  }
  if (text.length > MAX_INPUT_LENGTH) {
    throw new Error(`[extractors] "${label}" exceeds ${MAX_INPUT_LENGTH} character limit`);
  }
  if (detectInjection(text)) {
    throw new Error(`[extractors] "${label}" contains disallowed content`);
  }
  return text.trim();
}

/**
 * Extracts structured data from raw CV text.
 * @param cvText  Plain text extracted from the CV PDF
 * @returns {Promise<object>} Structured CV object
 */
export async function extractCVData(cvText: string): Promise<Record<string, unknown>> {
  const result = await callLLM({
    systemPrompt: EXTRACT_CV_PROMPT,
    userContent: sanitise(cvText, "cvText"),
    temperature: 0.2,
  });

  return result as Record<string, unknown>;
}

/**
 * Extracts structured data from a job listing (raw text or PDF text).
 * @param jobText  Plain text of the job description
 * @returns {Promise<object>} Structured job object
 */
export async function extractJobData(jobText: string): Promise<Record<string, unknown>> {
  const result = await callLLM({
    systemPrompt: EXTRACT_JOB_PROMPT,
    userContent: sanitise(jobText, "jobText"),
    temperature: 0.2,
  });

  return result as Record<string, unknown>;
}
