import { type PipelineResult } from '../../types/schemas/pipeline.schemas.js';
import { generateApplication } from '../application/application.service.js';
import { repairCV } from '../cv/cvRepair.service.js';
import { repairJob } from '../job/jobRepair.service.js';
import { matchCVToJob } from '../match/match.service.js';

import type { LLMExecutionOptions } from '../../types/llm.types.js';
import type { CVParsed, JobParsed } from '@applera/schemas';

export type Input = Buffer | string;

/**
 * Pipeline starting from already-parsed CV and job data.
 * Used when data is already in DB (e.g. from controller).
 */
export async function runApplicationPipelineFromParsed(
  cv: CVParsed,
  job: JobParsed,
  rawText: string,
  opts: LLMExecutionOptions = {},
): Promise<PipelineResult> {
  const { signal, reserveUsage, refundUsage } = opts;

  // Step 1: repair/normalize (sync, nothing to cancel)
  const cleanCV = repairCV(cv);
  const cleanJob = repairJob(job);

  signal?.throwIfAborted();

  // Step 2: match scoring
  const match = await matchCVToJob(cleanCV, cleanJob, {
    signal,
    reserveUsage,
    refundUsage,
  });

  signal?.throwIfAborted();

  // Step 3: application generation
  const application = await generateApplication(cleanCV, cleanJob, rawText, match, {
    signal,
    reserveUsage,
    refundUsage,
  });

  return {
    cv: cleanCV,
    job: cleanJob,
    match,
    application,
    snapshot: {
      cvNameSnapshot: cleanCV.name?.trim() || 'CV',
      jobTitleSnapshot: cleanJob.title?.trim() || 'Untitled Role',
      companySnapshot: cleanJob.company?.trim() || 'Unknown Company',
      locationSnapshot: cleanJob.location?.trim() || '',
    },
  };
}
