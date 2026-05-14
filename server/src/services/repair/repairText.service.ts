import { MAX_LENGTH } from "../../utils/utils.js";

export type NormalizeOptions = {
  type?: "cv" | "job";
  maxLength?: number;
  skills?: string[];
  preserveCase?: boolean;
};

export function normalizeText(text: string, options: NormalizeOptions = {}): string {
  if (typeof text !== "string") {
    throw new TypeError("[normalizeText] input must be a string");
  }

  const { type = "job", maxLength = MAX_LENGTH, skills = [], preserveCase = false } = options;

  let t = text.trim();

  // ── Normalize structure
  t = t
    .replace(/\r/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/•/g, "-")
    .replace(/\u2022/g, "-")
    .replace(/[ \t]+/g, " ")
    .replace(/\s+([,.!?])/g, "$1");

  // ── Remove noise (job-specific)
  if (type === "job") {
    t = t.replace(/apply now|click here|view all jobs|cookie policy/gi, "");
    t = t.replace(/job description[:\-]?|about the role[:\-]?|what you'll do[:\-]?/gi, "");
  }

  // ── Remove CV noise
  if (type === "cv") {
    t = t.replace(/references available upon request/gi, "");
  }

  // ── Skill normalization (safe version)
  // ONLY for matching layer, not for display
  if (skills.length > 0) {
    for (const skill of skills) {
      const normalizedSkill = skill.toLowerCase().replace(/[\s.\-_/]/g, "");

      // escape regex safely
      const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const pattern = escaped.replace(/\s+/g, "\\s+");

      const regex = new RegExp(`\\b${pattern}\\b`, "gi");

      t = t.replace(regex, normalizedSkill);
    }
  }

  // ── Case handling (IMPORTANT FIX)
  if (!preserveCase) {
    t = t; // keep original case (default safe)
  }

  // ── Truncate
  if (t.length > maxLength) {
    t = t.slice(0, maxLength);
  }

  return t;
}
