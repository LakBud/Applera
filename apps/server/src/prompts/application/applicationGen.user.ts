import type { CVParsed } from '@repo/schemas';

import type { MatchReport } from '../../types/schemas/match.schemas.js';
import type { JobSchemaData } from '../../types/schemas/schema.js';

export function buildApplicationPrompt(
  cv: CVParsed,
  job: JobSchemaData,
  match: MatchReport,
): string {
  return `
  LANGUAGE: Detect from raw_description above and write ALL output in that language.
  
CV:
${JSON.stringify({ name: cv.name, summary: cv.summary, skills: cv.skills, experience: cv.experience, seniority_level: cv.seniority_level }, null, 2)}

JOB:
${JSON.stringify(
  {
    title: job.title,
    company: job.company,
    location: job.location,
    required_skills: job.required_skills,
    responsibilities: job.responsibilities,
    seniority: job.seniority,
    raw_description: job.raw_description,
  },
  null,
  2,
)}

MATCH (DO NOT RECOMPUTE):
${JSON.stringify({ score: match.score, strengths: match.strengths, missing_skills: match.missing_skills }, null, 2)}

TASK:
Generate a structured job application JSON strictly following the schema.
`.trim();
}
