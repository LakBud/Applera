import { CACHE_VERSIONS } from '../../config/cache.versions.js';
import { deleteCache } from '../../lib/cache.js';
import InterviewPrep from '../../models/InterviewPrep.js';
import { NotFoundError } from '../../utils/errors/notFound.error.js';
import { generateInterviewPrep } from './generateInterviewPrep.service.js';
import {
  loadApplicationContext,
  saveInterviewPrep,
  validateContext,
} from './interviewPrep.helpers.service.js';

import type { LLMExecutionOptions } from '../../types/llm.types.js';
import type { Identity } from '../../types/schemas/identity.schemas.js';

// Service for POST /api/interview/:applicationId
export async function createInterviewPrep(
  applicationId: string,
  identity: Identity,
  { signal, reserveUsage, refundUsage }: LLMExecutionOptions = {},
) {
  signal?.throwIfAborted();

  const { cv, job, rawText, match } = await loadApplicationContext(applicationId, identity);

  signal?.throwIfAborted();

  await deleteCache(`interview:${CACHE_VERSIONS.interview}:${applicationId}`);

  signal?.throwIfAborted();

  const { cv: parsedCV, job: parsedJob } = validateContext(cv, job);

  signal?.throwIfAborted();

  const prep = await generateInterviewPrep(parsedCV, parsedJob, rawText, match, applicationId, {
    signal,
    reserveUsage,
    refundUsage,
  });

  signal?.throwIfAborted();

  const saved = await saveInterviewPrep(applicationId, identity, prep);

  return { prep, saved };
}

// Service for GET /api/interview/:applicationId
export async function getInterviewPrep(applicationId: string, identity: Identity) {
  const prep = await InterviewPrep.findOne({
    application: applicationId,
    ownerId: identity.id,
    ownerType: identity.type,
  });

  if (!prep) {
    throw new NotFoundError('No interview prep found. Generate one first.');
  }

  return prep;
}
