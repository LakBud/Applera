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
  calculateScore,
  getSeniorityFit,
} from "../utils/match.utils.js";
import { MatchReport } from "../types/match.types.js";
import { CVSchemaData, JobSchemaData } from "../types/schema.js";

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * @param cv   Structured CV from extractCVData
 * @param job  Structured job from extractJobData
 * @returns Match report — synchronous, no LLM call
 */
export async function matchCVToJob(cv: CVSchemaData, job: JobSchemaData): Promise<MatchReport> {
  const key = `match:${hash(
    JSON.stringify({
      cvSkills: cv.skills,
      jobSkills: job.required_skills,
      cvText: extractAllText(cv),
      jobText: extractAllText(job),
    }),
  )}`;

  const cached = await getCache<MatchReport>(key);
  if (cached) return cached;

  // ── CORE LOGIC ───────────────────────────────────────────────

  const cvSkills = normalizeSkills(cv.skills);
  const jobSkills = normalizeSkills(job.required_skills);

  const matchingSkills = jobSkills.filter((jobSkill) => cvSkills.some((cvSkill) => isSkillMatch(cvSkill, jobSkill)));

  const missingSkills = jobSkills.filter((jobSkill) => !matchingSkills.includes(jobSkill));

  const textScore = calculateTextOverlap(extractAllText(cv), extractAllText(job));

  const score = calculateScore(matchingSkills, jobSkills, textScore);

  const seniorityFit = getSeniorityFit(cv.seniority_level, job.seniority);

  const result: MatchReport = {
    score,
    strengths: matchingSkills,
    missing_skills: missingSkills,
    seniority_fit: seniorityFit,
    domain_mismatch: detectDomainMismatch(cvSkills, jobSkills),
    confidence: getConfidenceLevel({ cvSkills, jobSkills, textScore }),
    recommendation: generateRecommendation(score),
    text_overlap: textScore,
  };

  await setCache(key, result, 60 * 60 * 24);

  return result;
}
