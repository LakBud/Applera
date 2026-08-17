import {
  APPLICATION_STATUSES,
  CVParsedSchema,
  JobParsedSchema,
  type ApplicationStatus,
} from '@applera/schemas';

import Application from '../../models/Application.js';
import CVModel from '../../models/CV.js';
import JobModel from '../../models/Job.js';
import { BadRequestError } from '../../utils/errors/badRequest.error.js';
import { NotFoundError } from '../../utils/errors/notFound.error.js';
import { runApplicationPipelineFromParsed } from '../pipeline/pipeline.service.js';

import type { LLMExecutionOptions } from '../../types/llm.types.js';
import type { Identity } from '../../types/schemas/identity.schemas.js';

// Service for GET /api/application
export async function listApplications(identity: Identity) {
  const { id: ownerId, type: ownerType } = identity;

  return Application.find({
    ownerId,
    ownerType,
  })
    .populate('cv', 'parsed applicationsCount lastUsedAt')
    .populate('job', 'parsed company location')
    .sort({ createdAt: -1 });
}

// Service for GET /api/application/:id
export async function getApplicationById(id: string, identity: Identity) {
  const application = await Application.findOne({
    _id: id,
    ownerId: identity.id,
    ownerType: identity.type,
  })
    .populate('cv')
    .populate('job');

  if (!application) {
    throw new NotFoundError('Application not found');
  }

  return application;
}

// Service for PATCH /api/application/:id/status
export async function updateApplicationStatus(id: string, identity: Identity, status: unknown) {
  const { id: ownerId, type: ownerType } = identity;

  if (!APPLICATION_STATUSES.includes(status as ApplicationStatus)) {
    throw new BadRequestError(`Invalid status. Must be one of: ${APPLICATION_STATUSES.join(', ')}`);
  }

  const updated = await Application.findOneAndUpdate(
    {
      _id: id,
      ownerId,
      ownerType,
    },
    {
      $set: { status },
    },
    {
      returnDocument: 'after',
    },
  )
    .populate('cv', 'parsed applicationsCount lastUsedAt')
    .populate('job', 'parsed company location');

  if (!updated) {
    throw new NotFoundError('Application not found');
  }

  return updated;
}

// Service for DELETE /api/application/:id
export async function deleteApplication(id: string, identity: Identity) {
  const { id: ownerId, type: ownerType } = identity;

  const deleted = await Application.findOneAndDelete({
    _id: id,
    ownerId,
    ownerType,
  });

  if (!deleted) {
    throw new NotFoundError('Application not found');
  }

  return deleted;
}

// Service for POST /api/application
export async function createApplication(
  identity: Identity,
  cvId: string,
  jobId: string,
  { signal, reserveUsage, refundUsage }: LLMExecutionOptions = {},
) {
  const { id: ownerId, type: ownerType } = identity;

  const [cv, job] = await Promise.all([
    CVModel.findOne({
      _id: { $eq: cvId },
      ownerId: { $eq: ownerId },
      ownerType: { $eq: ownerType },
    }),
    JobModel.findOne({
      _id: { $eq: jobId },
      ownerId: { $eq: ownerId },
      ownerType: { $eq: ownerType },
    }),
  ]);

  if (!cv || !job) {
    throw new NotFoundError('CV or Job not found');
  }

  if (!cv.parsed) throw new BadRequestError('CV not parsed');
  if (!job.parsed) throw new BadRequestError('Job not parsed');

  const parsedCV = CVParsedSchema.parse(cv.parsed);
  const parsedJob = JobParsedSchema.parse(job.parsed);

  const result = await runApplicationPipelineFromParsed(parsedCV, parsedJob, job.rawText ?? '', {
    signal,
    reserveUsage,
    refundUsage,
  });

  const application = await Application.create({
    ownerId,
    ownerType,
    cv: cv._id,
    job: job._id,
    ...result.snapshot,
    match: result.match,
    tailoring_advice: result.application.tailoring_advice,
    cover_letter: [
      result.application.application_letter.introduction,
      result.application.application_letter.body,
      result.application.application_letter.closing,
    ].join('\n\n'),
    application_email: result.application.email_template,
    status: 'generated',
  });

  await application.populate('cv', 'parsed applicationsCount lastUsedAt');
  await application.populate('job', 'parsed company location');

  return application;
}
