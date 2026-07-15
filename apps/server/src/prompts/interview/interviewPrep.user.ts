import type { MatchReport } from '../../types/schemas/match.schemas.js';
import type { CVParsed, JobParsed } from '@applera/schemas';

export function buildInterviewPrepPrompt(
  cv: CVParsed,
  job: JobParsed,
  match: MatchReport,
  rawText: string | null | undefined,
): string {
  const langSample = rawText?.trim().slice(0, 300) || '[none provided]';

  return `

CV:
${JSON.stringify(
  {
    name: cv.name,
    summary: cv.summary,
    skills: cv.skills,
    experience: cv.experience,
    education: cv.education,
    projects: cv.projects,
    seniority_level: cv.seniority_level,
  },
  null,
  2,
)}

JOB:
${JSON.stringify(
  {
    title: job.title,
    company: job.company,
    location: job.location,
    required_skills: job.required_skills,
    responsibilities: job.responsibilities,
    seniority: job.seniority,
  },
  null,
  2,
)}

MATCH (DO NOT RECOMPUTE):
${JSON.stringify(
  {
    score: match.score,
    strengths: match.strengths,
    missing_skills: match.missing_skills,
    seniority_fit: match.seniority_fit,
    domain_mismatch: match.domain_mismatch,
  },
  null,
  2,
)}

LANGUAGE:
Detect the language ONLY from this reference text: "${langSample}"

Write all generated content exclusively in the detected language.

TASK:
Generate structured interview prep JSON strictly following the schema.
`.trim();
}
