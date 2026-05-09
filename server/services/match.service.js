import { normalizeArray } from "../utils/text.utils.js";
import {
  getConfidenceLevel,
  isSkillMatch,
  extractAllText,
  calculateTextOverlap,
  generateRecommendation,
} from "../utils/match.utils.js";

export function matchCVtoJob(cv, job) {
  const cvSkills = normalizeArray(cv?.skills);
  const jobSkills = normalizeArray(job?.required_skills);

  const matchedSkills = [];
  const missingSkills = [];

  for (const jobSkill of jobSkills) {
    const match = cvSkills.some((cvSkill) => isSkillMatch(cvSkill, jobSkill));

    if (match) matchedSkills.push(jobSkill);
    else missingSkills.push(jobSkill);
  }

  const skillScore = jobSkills.length === 0 ? 50 : (matchedSkills.length / jobSkills.length) * 100;

  const textScore = calculateTextOverlap(extractAllText(cv), extractAllText(job));

  const score = Math.max(0, Math.round(skillScore * 0.7 + textScore * 0.3));

  const confidence = getConfidenceLevel({
    cvSkills,
    jobSkills,
    textScore,
  });

  return {
    score,
    strengths: matchedSkills,
    missing_skills: missingSkills,
    confidence,
    analysis: {
      skill_match: Math.round(skillScore),
      text_relevance: Math.round(textScore),
    },
    recommendation: generateRecommendation(score),
  };
}
