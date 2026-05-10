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
  isPlainObject,
  calculateScore,
  getSeniorityFit,
} from "../utils/match.utils.js";
import { CVData, JobData } from "../types/types.js";
import { MatchReport } from "../types/match.types.js";

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
