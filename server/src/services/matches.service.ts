import { hash } from "../lib/hash.js";
import { getCache, setCache } from "../lib/cache.js";
import {
  normalizeSkills,
  isSkillMatch,
  detectDomainMismatch,
  extractAllText,
  calculateTextOverlap,
  getConfidenceLevel,
  generateRecommendation,
} from "../utils/match.utils.js";
import { CVData, JobData } from "../types/extractors.types.js";

// ── Types ─────────────────────────────────────────────────────────────────────

export type ConfidenceLevel = "high" | "medium" | "low";

export type MatchReport = {
  score: number;
  strengths: string[];
  missing_skills: string[];
  seniority_fit: "under" | "over" | "match";
  domain_mismatch: boolean;
  confidence: ConfidenceLevel;
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
  if (jobSkills.length === 0) return textScore;

  const ratio = matchingSkills.length / jobSkills.length;

  const skillScore = Math.pow(ratio, 0.75) * 100;

  const presenceBoost = matchingSkills.length > 0 ? 10 : 0;

  const score = skillScore * 0.55 + textScore * 0.45 + presenceBoost;

  return Math.round(Math.max(0, Math.min(100, score)));
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
export async function matchCVToJob(cv: CVData, job: JobData): Promise<MatchReport> {
  for (const [label, val] of [
    ["cv", cv],
    ["job", job],
  ] as const) {
    if (!isPlainObject(val)) {
      throw new TypeError(`[matchService] "${label}" must be a plain object`);
    }
  }

  // ── Cache key (order-safe + deterministic) ───────────────────────────
  const key = `match:${hash(
    JSON.stringify({
      cvSkills: cv.skills ?? [],
      jobSkills: job.required_skills ?? [],
      cvText: extractAllText(cv),
      jobText: extractAllText(job),
    }),
  )}`;

  // ── Try cache first ───────────────────────────────────────────────────
  const cached = await getCache<MatchReport>(key);
  if (cached) return cached;

  // ── Compute match ─────────────────────────────────────────────────────
  const cvSkills = normalizeSkills((cv.skills ?? []) as unknown[]);
  const jobSkills = normalizeSkills((job.required_skills ?? []) as unknown[]);

  const matchingSkills = jobSkills.filter((jobSkill) => cvSkills.some((cvSkill) => isSkillMatch(cvSkill, jobSkill)));

  const missingSkills = jobSkills.filter((jobSkill) => !matchingSkills.includes(jobSkill));

  const cvText = extractAllText(cv);
  const jobText = extractAllText(job);

  const textScore = calculateTextOverlap(cvText, jobText);
  const score = calculateScore(matchingSkills, jobSkills, textScore);

  const seniorityFit = getSeniorityFit((cv.seniority_level as string) ?? "", (job.seniority as string) ?? "");

  const domainMismatch = detectDomainMismatch(cvSkills, jobSkills);
  const confidence = getConfidenceLevel({ cvSkills, jobSkills, textScore });
  const recommendation = generateRecommendation(score);

  const result: MatchReport = {
    score,
    strengths: matchingSkills,
    missing_skills: missingSkills,
    seniority_fit: seniorityFit,
    domain_mismatch: domainMismatch,
    confidence,
    recommendation,
    text_overlap: textScore,
  };

  // ── Store in cache (24h is safe) ──────────────────────────────────────
  await setCache(key, result, 60 * 60 * 24);

  return result;
}
