import { extractAllText } from '../utils/match/text.utils.js';

import type { MatchReport } from '../types/schemas/match.schemas.js';
import type { CVParsed, JobParsed } from '@repo/schemas';

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

Respond ONLY with valid JSON matching this shape exactly:
{
  "semantic_matches": string[],
  "implicit_skills": string[],
  "reasoning": string,
  "adjusted_score": number
}`,

    userContent: `CV skills: ${cv.skills?.join(', ')}
CV text: ${extractAllText(cv).slice(0, 2000)}

Job requires: ${job.required_skills?.join(', ')}
Job description: ${extractAllText(job).slice(0, 1000)}

Math pass found:
- Matched: ${mathResult.strengths.join(', ') || 'none'}
- Missing: ${mathResult.missing_skills.join(', ') || 'none'}
- Score: ${mathResult.score}`,
  };
};
