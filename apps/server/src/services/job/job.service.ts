import { extractTextFromPdf } from '../../lib/pdfParser.js';
import Job from '../../models/Job.js';
import { NotFoundError } from '../../utils/errors/notFound.error.js';
import { normalizeString } from '../../utils/shared/repair.utils.js';
import { extractJobData } from '../extractors.service.js';

import type { LLMExecutionOptions } from '../../types/llm.types.js';
import type { Identity } from '../../types/schemas/identity.schemas.js';

export type CreateJobInput = { source: 'pdf'; buffer: Buffer } | { source: 'text'; text: string };

// Service for POST /api/job
export async function createJob(
  identity: Identity,
  input: CreateJobInput,
  { signal, reserveUsage, refundUsage }: LLMExecutionOptions = {},
) {
  signal?.throwIfAborted();

  const rawText =
    input.source === 'pdf'
      ? await extractTextFromPdf(input.buffer, { signal })
      : normalizeString(input.text);

  signal?.throwIfAborted();

  const parsed = await extractJobData(rawText, { signal, reserveUsage, refundUsage });

  signal?.throwIfAborted();

  const createdJob = await Job.create({
    ownerId: identity.id,
    ownerType: identity.type,
    rawText,
    parsed,
  });

  return createdJob;
}

// Service for GET /api/job
export async function getJobs(identity: Identity) {
  return Job.find({
    ownerId: identity.id,
    ownerType: identity.type,
  })
    .sort({ createdAt: -1 })
    .select('-rawText');
}

// Service for GET /api/job/:id
export async function getJobById(id: string, identity: Identity) {
  const job = await Job.findOne({
    _id: id,
    ownerId: identity.id,
    ownerType: identity.type,
  });

  if (!job) {
    throw new NotFoundError('Job not found');
  }

  return job;
}

// Service for DELETE /api/job/:id
export async function deleteJob(id: string, identity: Identity) {
  const deleted = await Job.findOneAndDelete({
    _id: id,
    ownerId: identity.id,
    ownerType: identity.type,
  });

  if (!deleted) {
    throw new NotFoundError('Job not found');
  }

  return deleted;
}
