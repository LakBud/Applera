import { expandCanonicalSkills, isJobSkillCovered, normalizeSkills } from './skills/skill.utils.js';

export function weightedSkillScore(cvSkills: string[], jobSkills: string[]): number {
  const cvCanonical = expandCanonicalSkills(cvSkills);

  let total = 0;
  let matched = 0;

  for (const skill of jobSkills) {
    total++;

    if (isJobSkillCovered(cvCanonical, skill)) {
      matched++;
    }
  }

  return total === 0 ? 0 : Math.round((matched / total) * 100);
}

// Weighted blend:
//   85% — skill overlap   (most important signal)
//   15% — text overlap    (catches experience, domain language, responsibilities)

export function calculateScore(cvSkills: string[], jobSkills: string[], textScore: number): number {
  const skillScore = weightedSkillScore(cvSkills, jobSkills);
  const raw = skillScore * 0.85 + textScore * 0.15;
  return Math.round(Math.min(100, Math.max(0, raw)));
}

/* ── Domain mismatch ──────────────────────────────────────────────────────── */

/**
 * Returns true if CV and job skills have very little overlap —
 * suggesting the candidate is applying outside their domain.
 *
 */
export function detectDomainMismatch(cvSkills: unknown, jobSkills: unknown): boolean {
  const cv = expandCanonicalSkills(cvSkills as string[]);
  const job = normalizeSkills(jobSkills);

  if (job.length < 3) return false;

  let overlap = 0;

  for (const skill of job) {
    if (isJobSkillCovered(cv, skill)) {
      overlap++;
    }
  }

  return overlap / job.length < 0.25;
}

/* ── Recommendation ───────────────────────────────────────────────────────── */

/**
 * Returns a human-readable recommendation string based on the match score.
 */
export function generateRecommendation(score: number): string {
  if (score >= 80) {
    return 'Strong match — apply immediately';
  }
  if (score >= 60) {
    return 'Good match — consider applying';
  }
  if (score >= 40) {
    return 'Moderate match — improve CV first';
  }
  return 'Weak match — not recommended';
}
