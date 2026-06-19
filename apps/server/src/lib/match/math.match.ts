import type { CVParsed } from '@repo/schemas';

import type { MatchReport } from '../../types/schemas/match.schemas.js';
import { type JobSchemaData } from '../../types/schemas/schema.js';
import {
  calculateScore,
  calculateTextOverlap,
  detectDomainMismatch,
  expandSkills,
  extractAllText,
  generateRecommendation,
  getConfidenceLevel,
  getSeniorityFit,
  normalizeSkill,
  normalizeSkills,
} from '../../utils/match/match.utils.js';

// ── Math pass ─────────────────────────────────────────────────────────────────

export function runMathMatch(cv: CVParsed, job: JobSchemaData): Omit<MatchReport, 'ai_insights'> {
  const cvSkills = normalizeSkills(cv.skills);
  const jobSkills = normalizeSkills(job.required_skills);
  const cvExpanded = expandSkills(cvSkills);

  // use the same expansion logic as calculateScore so strengths/score agree
  const matchingSkills = jobSkills.filter((s) => cvExpanded.has(normalizeSkill(s)));
  const missingSkills = jobSkills.filter((s) => !cvExpanded.has(normalizeSkill(s)));

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
