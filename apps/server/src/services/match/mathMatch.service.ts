import {
  calculateScore,
  detectDomainMismatch,
  generateRecommendation,
} from '../../utils/match/score.utils.js';
import { getSeniorityFit } from '../../utils/match/seniority.utils.js';
import {
  isJobSkillCovered,
  normalizeSkills,
  expandCanonicalSkills,
  buildNormalizedToDisplayMap,
} from '../../utils/match/skills/skill.utils.js';
import {
  calculateTextOverlap,
  extractAllText,
  getConfidenceLevel,
} from '../../utils/match/text.utils.js';

import type { MatchReport } from '../../types/schemas/match.schemas.js';
import type { CVParsed, JobParsed } from '@applera/schemas';

export function runMathMatch(cv: CVParsed, job: JobParsed): Omit<MatchReport, 'ai_insights'> {
  const cvSkills = normalizeSkills(cv.skills);
  const jobSkills = normalizeSkills(job.required_skills);

  const cvExpanded = expandCanonicalSkills(cv.skills ?? []);

  // Map job skills back to their original display form (normalizeSkill's output isn't user-facing)
  const jobNormalizedToDisplay = buildNormalizedToDisplayMap(job.required_skills ?? []);
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
