import { MAX_LENGTH } from "../utils/utils.js";

/**
 * CV Repair Service
 * ------------------
 * Cleans raw CV input before LLM processing.
 *
 * This improves:
 * - extraction accuracy
 * - skill detection
 * - match scoring
 */
export function repairCVText(raw: string): string {
  if (typeof raw !== "string") {
    throw new TypeError("[cvRepair] CV must be a string");
  }

  let text = raw.trim();

  // 1. normalize whitespace
  text = text.replace(/\r/g, "");
  text = text.replace(/[ \t]+/g, " ");
  text = text.replace(/\n{3,}/g, "\n\n");

  // 2. remove common PDF/OCR noise
  text = text.replace(/page \d+ of \d+/gi, "");
  text = text.replace(/confidential/gi, "");

  // 3. remove broken bullets
  text = text.replace(/•/g, "-");

  // 4. fix repeated spaces around punctuation
  text = text.replace(/\s+([,.!?])/g, "$1");

  // 5. truncate safety
  if (text.length > MAX_LENGTH) {
    text = text.slice(0, MAX_LENGTH);
  }

  return text;
}
