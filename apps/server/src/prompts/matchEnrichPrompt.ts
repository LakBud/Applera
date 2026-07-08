import {
  CONFIDENCE_LEVELS,
  SENIORITY_FIT_VALUES,
  type CVParsed,
  type JobParsed,
} from '@applera/schemas';

import { extractAllText } from '../utils/match/text.utils.js';

import type { MatchReport } from '../types/schemas/match.schemas.js';

const seniorityFitOptions = SENIORITY_FIT_VALUES.map((v) => `"${v}"`).join(' | ');
const confidenceOptions = CONFIDENCE_LEVELS.map((v) => `"${v}"`).join(' | ');

export const buildMatchEnrichPrompt = (
  cv: CVParsed,
  job: JobParsed,
  mathResult: Omit<MatchReport, 'ai_insights'>,
): { systemPrompt: string; userContent: string } => {
  return {
    systemPrompt: `You are a technical recruiter assistant. Analyse a CV against a job and find matches
that string comparison missed. Look for:
- Skills listed differently ("Node" vs "backend development")
- Skills implied by experience ("built Kubernetes cluster" → Kubernetes)
- Transferable skills not in the skill list
- Related/adjacent skills that reasonably cover a required skill (e.g. "GitHub Actions" experience covers "CI/CD")

Focus specifically on the "Missing" list below — your job is to identify which of those
missing skills are actually covered by the candidate's real experience, even if the exact
keyword isn't present. Only include a skill in "semantic_matches" or "implicit_skills" if it
appears (verbatim) in the "Missing" list.

You will also review three judgments from an initial rule-based pass: seniority fit, domain
mismatch, and confidence. Only override a judgment if the CV/job text gives you a clear reason
to disagree — otherwise return the same value the math pass gave you. Do not second-guess a
correct rule-based judgment just to seem thorough.

- seniority_fit: one of ${seniorityFitOptions}. Base this on actual responsibility and scope
  in the CV, not just years of experience or job titles.
- domain_mismatch: true if the candidate's overall background is in a substantially
  different domain/industry than the job, even if individual skills overlap. false otherwise.
- confidence: one of ${confidenceOptions} — your confidence in this overall match assessment,
  considering both the rule-based signals and what you found in the free text.

Respond ONLY with valid JSON matching this shape exactly:
{
  "semantic_matches": string[],
  "implicit_skills": string[],
  "reasoning": string,
  "adjusted_score": number,
  "seniority_fit": ${seniorityFitOptions},
  "domain_mismatch": boolean,
  "confidence": ${confidenceOptions}
}`,

    userContent: `CV skills: ${cv.skills?.join(', ')}
CV seniority level: ${cv.seniority_level ?? 'unknown'}
CV text: ${extractAllText(cv).slice(0, 2000)}

Job requires: ${job.required_skills?.join(', ')}
Job seniority: ${job.seniority ?? 'unknown'}
Job description: ${extractAllText(job).slice(0, 1000)}

Math pass found:
- Matched: ${mathResult.strengths.join(', ') || 'none'}
- Missing: ${mathResult.missing_skills.join(', ') || 'none'}
- Score: ${mathResult.score}
- Seniority fit: ${mathResult.seniority_fit}
- Domain mismatch: ${mathResult.domain_mismatch}
- Confidence: ${mathResult.confidence}`,
  };
};
