// Computes a structured match report between a CV and a job listing.
//
// Matching is done LOCALLY using pure utility functions — no LLM call needed.
// This is faster, cheaper, and fully deterministic.
// The result is passed into generateApplication so the LLM focuses on
// writing the application, not recomputing analysis it's already been given.

import {
  normalizeSkills,
  isSkillMatch,
  detectDomainMismatch,
  extractAllText,
  calculateTextOverlap,
  getConfidenceLevel,
  generateRecommendation,
} from "../utils/match.utils.js";

// ── Seniority ─────────────────────────────────────────────────────────────────

const SENIORITY_RANK = { junior: 1, mid: 2, senior: 3, lead: 4, principal: 5 };

function rankSeniority(level = "") {
  const key = level.toLowerCase().trim();
  return SENIORITY_RANK[key] ?? 2; // default to mid if unknown
}

function getSeniorityFit(cvLevel, jobLevel) {
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

function calculateScore(matchingSkills, jobSkills, textScore) {
  const skillScore = jobSkills.length === 0 ? 0 : (matchingSkills.length / jobSkills.length) * 100;

  return Math.round(skillScore * 0.6 + textScore * 0.4);
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * @param {object} cv   Structured CV from extractCVData
 * @param {object} job  Structured job from extractJobData
 * @returns {object} Match report — synchronous, no LLM call
 */
export function matchCVToJob(cv, job) {
  for (const [label, val] of [
    ["cv", cv],
    ["job", job],
  ]) {
    if (!val || typeof val !== "object") {
      throw new TypeError(`[matchService] "${label}" must be a plain object`);
    }
  }

  const cvSkills = normalizeSkills(cv.skills ?? []);
  const jobSkills = normalizeSkills(job.required_skills ?? []);

  // Which job skills does the CV cover?
  const matchingSkills = jobSkills.filter((jobSkill) => cvSkills.some((cvSkill) => isSkillMatch(cvSkill, jobSkill)));

  // Which job skills are missing from the CV?
  const missingSkills = jobSkills.filter((jobSkill) => !matchingSkills.includes(jobSkill));

  // Full-text overlap catches experience descriptions, domain language, etc.
  const cvText = extractAllText(cv);
  const jobText = extractAllText(job);
  const textScore = calculateTextOverlap(cvText, jobText);

  const score = calculateScore(matchingSkills, jobSkills, textScore);
  const seniorityFit = getSeniorityFit(cv.seniority_level, job.seniority);
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
