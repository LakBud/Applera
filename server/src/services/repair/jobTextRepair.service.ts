/**
 * Job Repair Service
 * ------------------
 * Cleans and normalizes raw job descriptions before LLM processing.
 *
 * This improves:
 * - extraction quality
 * - skill detection accuracy
 * - structured parsing consistency
 *
 * IMPORTANT:
 * - This does NOT modify meaning
 * - Only removes noise and formatting issues
 */

const MAX_LENGTH = 20000;

export function repairJobText(jobText: string): string {
  if (typeof jobText !== "string") {
    throw new TypeError("[jobRepair] jobText must be a string");
  }

  let text = jobText.trim();

  // ── Normalize line breaks ───────────────────────────────────────────
  text = text.replace(/\r/g, "");
  text = text.replace(/\n{3,}/g, "\n\n");

  // ── Remove common job-board noise ───────────────────────────────────
  text = text.replace(/apply now/gi, "");
  text = text.replace(/click here/gi, "");
  text = text.replace(/view all jobs/gi, "");
  text = text.replace(/cookie policy/gi, "");

  // ── Normalize bullet points ─────────────────────────────────────────
  text = text.replace(/•/g, "-");
  text = text.replace(/\u2022/g, "-");

  // ── Fix spacing issues ──────────────────────────────────────────────
  text = text.replace(/[ \t]+/g, " ");
  text = text.replace(/\s+([,.!?])/g, "$1");

  // ── Remove excessive headers (common in scraped postings) ───────────
  text = text.replace(/job description[:\-]?/gi, "");
  text = text.replace(/about the role[:\-]?/gi, "");
  text = text.replace(/what you'll do[:\-]?/gi, "");

  // ── Truncate safety ─────────────────────────────────────────────────
  if (text.length > MAX_LENGTH) {
    text = text.slice(0, MAX_LENGTH);
  }

  return text;
}
