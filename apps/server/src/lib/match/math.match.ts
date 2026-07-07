import {
  calculateScore,
  detectDomainMismatch,
  generateRecommendation,
} from '../../utils/match/score.utils.js';
import { getSeniorityFit } from '../../utils/match/seniority.utils.js';
import {
  isJobSkillCovered,
  normalizeSkill,
  normalizeSkills,
  expandCanonicalSkillsWithDisplay,
} from '../../utils/match/skills/skill.utils.js';
import {
  calculateTextOverlap,
  extractAllText,
  getConfidenceLevel,
} from '../../utils/match/text.utils.js';

import type { MatchReport } from '../../types/schemas/match.schemas.js';
import type { CVParsed, JobParsed } from '@repo/schemas';

export function runMathMatch(cv: CVParsed, job: JobParsed): Omit<MatchReport, 'ai_insights'> {
  const cvSkills = normalizeSkills(cv.skills);
  const jobSkills = normalizeSkills(job.required_skills);

  const { canonicalSet: cvExpanded } = expandCanonicalSkillsWithDisplay(cv.skills ?? []);

  // Build a lookup from each job skill's NORMALIZED form (e.g.
  // "frontendwebtechnologies") back to its original, human-readable label
  // (e.g. "Frontend web technologies") as written in the job posting.
  // normalizeSkills() strips whitespace/punctuation purely for comparison;
  // that stripped form should never be shown to the user.
  const jobNormalizedToDisplay = new Map<string, string>();
  for (const raw of job.required_skills ?? []) {
    const original = String(raw ?? '').trim();
    if (!original) continue;
    const normalized = normalizeSkill(original);
    if (!normalized) continue;
    if (!jobNormalizedToDisplay.has(normalized)) {
      jobNormalizedToDisplay.set(normalized, original);
    }
  }

  const toDisplay = (normalized: string): string =>
    jobNormalizedToDisplay.get(normalized) ?? normalized;

  // use the same expansion logic as calculateScore so strengths/score agree
  const matchingSkills = jobSkills.filter((s) => isJobSkillCovered(cvExpanded, s));
  const missingSkills = jobSkills.filter((s) => !isJobSkillCovered(cvExpanded, s));

  // General keyword overlap
  const cvText = extractAllText(cv);
  const jobText = extractAllText(job);

  const textOverlapScore = calculateTextOverlap(cvText, jobText);

  // FINAL SCORE
  const score = calculateScore(cvSkills, jobSkills, textOverlapScore);

  return {
    score,
    strengths: matchingSkills.map(toDisplay),
    missing_skills: missingSkills.map(toDisplay),
    seniority_fit: getSeniorityFit(cv.seniority_level, job.seniority),
    domain_mismatch: detectDomainMismatch(cvSkills, jobSkills),
    confidence: getConfidenceLevel({ cvSkills, jobSkills, textScore: textOverlapScore }),
    recommendation: generateRecommendation(score),
    text_overlap: textOverlapScore,
  };
}
