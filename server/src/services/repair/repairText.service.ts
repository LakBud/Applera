import { MAX_LENGTH } from "../../utils/utils.js";

export type NormalizeOptions = {
  type?: "cv" | "job";
  maxLength?: number;
  skills?: string[]; // for dynamic merging of multi-word skills
};

export function normalizeText(text: string, options: NormalizeOptions = {}): string {
  if (typeof text !== "string") throw new TypeError("[normalizeText] input must be a string");

  const { type = "job", maxLength = MAX_LENGTH, skills = [] } = options;

  let t = text.trim();

  // ── Normalize line breaks
  t = t.replace(/\r/g, "").replace(/\n{3,}/g, "\n\n");

  // ── Normalize bullet points
  t = t.replace(/•/g, "-").replace(/\u2022/g, "-");

  // ── Fix spacing issues
  t = t.replace(/[ \t]+/g, " ").replace(/\s+([,.!?])/g, "$1");

  // ── Remove common noise
  if (type === "job") {
    t = t.replace(/apply now|click here|view all jobs|cookie policy/gi, "");
    t = t.replace(/job description[:\-]?|about the role[:\-]?|what you'll do[:\-]?/gi, "");
  } else if (type === "cv") {
    t = t.replace(/references available upon request/gi, "");
  }

  // ── Lowercase
  t = t.toLowerCase();

  // ── Merge multi-word skills dynamically
  if (skills.length > 0) {
    skills.forEach((skill) => {
      const normalized = skill.toLowerCase().replace(/[\s.\-_/]/g, "");
      const pattern = skill
        .trim()
        .split(/\s+/)
        .map((w) => w.replace(/[-_/]/g, "\\$&"))
        .join("\\s+");

      const regex = new RegExp(`\\b${pattern}\\b`, "gi");
      t = t.replace(regex, normalized);
    });
  }

  // ── Truncate to max length
  if (t.length > maxLength) t = t.slice(0, maxLength);

  return t;
}
