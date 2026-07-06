import {
  calculateScore,
  detectDomainMismatch,
  generateRecommendation,
} from '../../utils/match/score.utils.js';
import { getSeniorityFit } from '../../utils/match/seniority.utils.js';
import {
  expandCanonicalSkills,
  isJobSkillCovered,
  normalizeSkills,
} from '../../utils/match/skills/skill.utils.js';
import {
  calculateTextOverlap,
  extractAllText,
  getConfidenceLevel,
} from '../../utils/match/text.utils.js';

import type { MatchReport } from '../../types/schemas/match.schemas.js';
import type { CVParsed, JobParsed } from '@repo/schemas';

// ── Math pass ─────────────────────────────────────────────────────────────────

export function runMathMatch(cv: CVParsed, job: JobParsed): Omit<MatchReport, 'ai_insights'> {
  const cvSkills = normalizeSkills(cv.skills);
  const jobSkills = normalizeSkills(job.required_skills);
  const cvExpanded = expandCanonicalSkills(cvSkills);

  // use the same expansion logic as calculateScore so strengths/score agree
  const matchingSkills = jobSkills.filter((s) => isJobSkillCovered(cvExpanded, s));

  const missingSkills = jobSkills.filter((s) => !isJobSkillCovered(cvExpanded, s));

  const textScore = calculateTextOverlap(extractAllText(cv), extractAllText(job));
  const score = calculateScore(cvSkills, jobSkills, textScore);

  return {
    score,
    strengths: matchingSkills,
    missing_skills: missingSkills,
    seniority_fit: getSeniorityFit(cv.seniority_level, job.seniority),
    domain_mismatch: detectDomainMismatch(cvSkills, jobSkills),
    confidence: getConfidenceLevel({ cvSkills, jobSkills, textScore }),
    recommendation: generateRecommendation(score),
    text_overlap: textScore,
  };
}
