// Pure utility functions for CV-to-job matching.
// No side effects, no imports — easy to unit test in isolation.

import { MatchReport } from "../types/match.types.js";

/* ── Normalisation ────────────────────────────────────────────────────────── */

/**
 * Normalises a single skill string for comparison.
 * "Node.js" → "nodejs",  "React Native" → "reactnative"
 */
export function normalizeSkill(s: string): string {
  return String(s || "")
    .toLowerCase()
    .replace(/[\s.\-_/]/g, "") // strip spaces, dots, dashes, underscores, slashes
    .trim();
}

/**
 * Normalises an array of skills.
 * Removes duplicates after normalisation.
 * NOTE: normalizeArray was a separate function that duplicated this logic — removed.
 */
export function normalizeSkills(arr: unknown): string[] {
  if (!Array.isArray(arr)) return [];

  return [...new Set(arr.map((s) => normalizeSkill(String(s))).filter(Boolean))];
}

/* ── Skill matching ───────────────────────────────────────────────────────── */

/**
 * Returns true if two skills refer to the same technology.
 * Guards against single-character false positives (e.g. "C" ⊂ "C++").
 */
export function isSkillMatch(cvSkill: string, jobSkill: string): boolean {
  const a = normalizeSkill(cvSkill);
  const b = normalizeSkill(jobSkill);

  if (!a || !b) return false;
  if (a === b) return true;

  // Only allow substring matching when both sides are meaningful length
  // e.g. "react" inside "reactnative" is fine; "c" inside "css" is not
  const minLength = 4;
  if (a.length >= minLength && b.length >= minLength) {
    return a.includes(b) || b.includes(a);
  }

  return false;
}

/* ── Domain mismatch ──────────────────────────────────────────────────────── */

/**
 * Returns true if CV and job skills have very little overlap —
 * suggesting the candidate is applying outside their domain.
 *
 * BUG FIX: original compared raw strings; now normalises before comparing
 * so "React" and "react" are treated as the same skill.
 */
export function detectDomainMismatch(cvSkills: unknown, jobSkills: unknown): boolean {
  const cv = new Set(normalizeSkills(cvSkills));
  const job = normalizeSkills(jobSkills);

  if (job.length === 0) return false; // no job skills to compare against

  const overlap = job.filter((skill) => [...cv].some((cvSkill) => isSkillMatch(cvSkill, skill))).length;

  const similarity = overlap / job.length;
  return similarity < 0.15;
}

/* ── Text extraction ──────────────────────────────────────────────────────── */

/**
 * Flattens a structured CV or job object into a single plain-text string
 * suitable for word-overlap scoring.
 *
 * FIX: original used JSON.stringify on arrays, which added brackets and quotes
 * as noise words that inflated or deflated match scores incorrectly.
 */
export function extractAllText(obj: unknown): string {
  if (!obj || typeof obj !== "object") return "";

  const flatten = (val: unknown): string => {
    if (!val) return "";
    if (typeof val === "string") return val;
    if (Array.isArray(val)) return val.map(flatten).join(" ");
    if (typeof val === "object")
      return Object.values(val as Record<string, unknown>)
        .map(flatten)
        .join(" ");
    return String(val);
  };

  const o = obj as Record<string, unknown>;

  return [o.summary ?? "", flatten(o.skills), flatten(o.experience), flatten(o.education)].join(" ").replace(/\s+/g, " ").trim();
}

/* ── Text overlap score ───────────────────────────────────────────────────── */

/**
 * Returns what percentage of job description words also appear in the CV text.
 * Score range: 0–100.
 *
 * BUG FIX: original was case-sensitive — "React" and "react" didn't match.
 * Now lowercases and filters out short stop-words before comparing.
 */
export function calculateTextOverlap(cvText: string, jobText: string): number {
  if (!cvText || !jobText) return 0;

  const tokenise = (text: string): string[] =>
    text
      .toLowerCase()
      .split(/\W+/)
      .filter((w) => w.length > 2); // skip "a", "in", "of", etc.

  const cvWords = new Set(tokenise(cvText));
  const jobWords = tokenise(jobText);

  if (jobWords.length === 0) return 0;

  const matches = jobWords.filter((w) => cvWords.has(w)).length;
  return Math.round((matches / jobWords.length) * 100);
}

/* ── Confidence level ─────────────────────────────────────────────────────── */

/**
 * Rates how reliable the match score is based on data quality.
 * A low-confidence score means there wasn't enough information to judge well.
 */
export function getConfidenceLevel({
  cvSkills = [],
  jobSkills = [],
  textScore = 0,
}: {
  cvSkills?: string[];
  jobSkills?: string[];
  textScore?: number;
}): "high" | "medium" | "low" {
  let confidence = 100;

  if (jobSkills.length < 3) confidence -= 20;
  if (cvSkills.length < 3) confidence -= 15;
  if (textScore < 20) confidence -= 20;

  confidence = Math.max(0, Math.min(100, confidence)); // clamp 0–100

  if (confidence >= 75) return "high";
  if (confidence >= 45) return "medium";
  return "low";
}

// ── Seniority ─────────────────────────────────────────────────────────────────

const SENIORITY_RANK: Record<string, number> = {
  junior: 1,
  mid: 2,
  senior: 3,
  lead: 4,
  principal: 5,
};

function rankSeniority(level: string = ""): number {
  const key = level.toLowerCase().trim();
  return SENIORITY_RANK[key] ?? 2; // default to mid if unknown
}

export function getSeniorityFit(cvLevel: string, jobLevel: string): MatchReport["seniority_fit"] {
  const diff = rankSeniority(cvLevel) - rankSeniority(jobLevel);

  if (diff < 0) return "under";
  if (diff > 0) return "over";
  return "match";
}

// ── Score calculation ─────────────────────────────────────────────────────────
//
// Weighted blend:
//   60% — skill overlap   (most important signal)
//   40% — text overlap    (catches experience, domain language, responsibilities)

export function calculateScore(matchingSkills: string[], jobSkills: string[], textScore: number): number {
  if (jobSkills.length === 0) return textScore;

  // 1. Core requirement coverage (MOST IMPORTANT)
  const requiredCoverage = matchingSkills.length / jobSkills.length;

  // 2. Hard skill score (dominant signal)
  const skillScore = requiredCoverage * 100;

  // 3. Text signal (light weight only)
  const textComponent = textScore * 0.25;

  // 4. Bonus for strong technical match
  const bonus = requiredCoverage === 1 ? 12 : requiredCoverage >= 0.8 ? 6 : requiredCoverage > 0 ? 2 : 0;

  const final = skillScore * 0.7 + textComponent + bonus;

  return Math.round(Math.max(0, Math.min(100, final)));
}

// ── Runtime guard (safe object check) ─────────────────────────────────────────

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/* ── Recommendation ───────────────────────────────────────────────────────── */

/**
 * Returns a human-readable recommendation string based on the match score.
 */
export function generateRecommendation(score: number): string {
  if (score >= 80) return "Strong match — apply immediately";
  if (score >= 60) return "Good match — consider applying";
  if (score >= 40) return "Moderate match — improve CV first";
  return "Weak match — not recommended";
}
