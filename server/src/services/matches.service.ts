import {
  normalizeSkills,
  isSkillMatch,
  detectDomainMismatch,
  extractAllText,
  calculateTextOverlap,
  getConfidenceLevel,
  generateRecommendation,
} from "../utils/match.utils.js";

// ── Types ─────────────────────────────────────────────────────────────────────

export type CVData = Record<string, unknown>;
export type JobData = Record<string, unknown>;

export type MatchReport = {
  score: number;
  matching_skills: string[];
  missing_skills: string[];
  seniority_fit: "under" | "over" | "match";
  domain_mismatch: boolean;
  confidence: string;
  recommendation: string;
  text_overlap: number;
};

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

function getSeniorityFit(cvLevel: string, jobLevel: string): MatchReport["seniority_fit"] {
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

function calculateScore(matchingSkills: string[], jobSkills: string[], textScore: number): number {
  const skillScore = jobSkills.length === 0 ? 0 : (matchingSkills.length / jobSkills.length) * 100;

  return Math.round(skillScore * 0.6 + textScore * 0.4);
}

// ── Runtime guard (safe object check) ─────────────────────────────────────────

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * @param cv   Structured CV from extractCVData
 * @param job  Structured job from extractJobData
 * @returns Match report — synchronous, no LLM call
 */
export function matchCVToJob(cv: CVData, job: JobData): MatchReport {
  for (const [label, val] of [
    ["cv", cv],
    ["job", job],
  ] as const) {
    if (!isPlainObject(val)) {
      throw new TypeError(`[matchService] "${label}" must be a plain object`);
    }
  }

  const cvSkills = normalizeSkills((cv.skills ?? []) as unknown[]);
  const jobSkills = normalizeSkills((job.required_skills ?? []) as unknown[]);

  // Which job skills does the CV cover?
  const matchingSkills = jobSkills.filter((jobSkill) => cvSkills.some((cvSkill) => isSkillMatch(cvSkill, jobSkill)));

  // Which job skills are missing from the CV?
  const missingSkills = jobSkills.filter((jobSkill) => !matchingSkills.includes(jobSkill));

  // Full-text overlap catches experience descriptions, domain language, etc.
  const cvText = extractAllText(cv);
  const jobText = extractAllText(job);
  const textScore = calculateTextOverlap(cvText, jobText);

  const score = calculateScore(matchingSkills, jobSkills, textScore);
  const seniorityFit = getSeniorityFit((cv.seniority_level as string) ?? "", (job.seniority as string) ?? "");

  const domainMismatch = detectDomainMismatch(cvSkills, jobSkills);
  const confidence = getConfidenceLevel({ cvSkills, jobSkills, textScore });
  const recommendation = generateRecommendation(score);

  return {
    score,
    matching_skills: matchingSkills,
    missing_skills: missingSkills,
    seniority_fit: seniorityFit,
    domain_mismatch: domainMismatch,
    confidence,
    recommendation,
    text_overlap: textScore,
  };
}
