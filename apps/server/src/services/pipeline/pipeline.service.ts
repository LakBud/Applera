import type { CVParsed } from '@repo/schemas';

import { type PipelineResult } from '../../types/schemas/pipeline.schemas.js';
import { type JobSchemaData } from '../../types/schemas/schema.js';
import { generateApplication } from '../application/application.service.js';
import { repairCV } from '../cv/cvRepair.service.js';
import { repairJob } from '../job/jobRepair.service.js';
import { matchCVToJob } from '../match/match.service.js';

export type Input = Buffer | string;

// ─────────────────────────────────────────────────────────────
// Main pipeline
// ─────────────────────────────────────────────────────────────

/**
 * Pipeline starting from already-parsed CV and job data.
 * Used when data is already in DB (e.g. from controller).
 */
export async function runApplicationPipelineFromParsed(
  cv: CVParsed,
  job: JobSchemaData,
): Promise<PipelineResult> {
  // Step 1: repair/normalize
  const cleanCV = repairCV(cv);
  const cleanJob = repairJob(job);

  // Step 2: match scoring
  const match = await matchCVToJob(cleanCV, cleanJob);

  // Step 3: application generation
  const application = await generateApplication(cleanCV, cleanJob, match);
  const applicationLetter = application.application_letter ?? {};

  return {
    cv: cleanCV,
    job: cleanJob,
    match,
    application: {
      ...application,
      application_letter: {
        introduction: applicationLetter.introduction ?? '',
        body: applicationLetter.body ?? '',
        closing: applicationLetter.closing ?? '',
      },
    },
    snapshot: {
      cvNameSnapshot: cleanCV.name?.trim() || 'CV',
      jobTitleSnapshot: cleanJob.title?.trim() || 'Untitled Role',
      companySnapshot: cleanJob.company?.trim() || 'Unknown Company',
      locationSnapshot: cleanJob.location?.trim() || '',
    },
  };
}
