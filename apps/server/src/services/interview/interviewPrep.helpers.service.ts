import { CVParsedSchema, JobParsedSchema, type CVParsed, type JobParsed } from '@applera/schemas';

import Application from '../../models/Application.js';
import CV from '../../models/CV.js';
import InterviewPrep from '../../models/InterviewPrep.js';
import Job from '../../models/Job.js';
import { BadRequestError } from '../../utils/errors/badRequest.error.js';
import { NotFoundError } from '../../utils/errors/notFound.error.js';
import { generateInterviewPrep } from './generateInterviewPrep.service.js';

import type { Identity } from '../../types/schemas/identity.schemas.js';
import type { MatchReport } from '../../types/schemas/match.schemas.js';

// get cv, job, rawText and match
export async function loadApplicationContext(applicationId: string, identity: Identity) {
  const application = await Application.findOne({
    _id: applicationId,
    ownerId: identity.id,
    ownerType: identity.type,
  })
    .select('cv job match ownerId ownerType')
    .lean();

  if (!application) {
    throw new NotFoundError('Application not found');
  }

  const [cvDoc, jobDoc] = await Promise.all([
    CV.findById(application.cv).select('parsed').lean(),
    Job.findById(application.job).select('parsed rawText').lean(),
  ]);

  const cv = cvDoc?.parsed;
  const job = jobDoc?.parsed;
  const rawText = jobDoc?.rawText;
  const match = application.match as MatchReport | undefined;

  if (!cv || !job) {
    throw new BadRequestError('Missing CV or Job parsed data');
  }

  if (!match) {
    throw new BadRequestError('Missing match data');
  }

  return { cv, job, rawText, match };
}

// validate cv and job
export function validateContext(cv: unknown, job: unknown): { cv: CVParsed; job: JobParsed } {
  const parsedCV = CVParsedSchema.safeParse(cv);
  const parsedJob = JobParsedSchema.safeParse(job);

  if (!parsedCV.success || !parsedJob.success) {
    throw new BadRequestError('Invalid CV or Job parsed data.');
  }

  return { cv: parsedCV.data, job: parsedJob.data };
}

// return DB query
export async function saveInterviewPrep(
  applicationId: string,
  identity: Identity,
  prep: Awaited<ReturnType<typeof generateInterviewPrep>>,
) {
  return InterviewPrep.findOneAndUpdate(
    {
      application: applicationId,
      ownerId: identity.id,
      ownerType: identity.type,
    },
    {
      application: applicationId,
      ownerId: identity.id,
      ownerType: identity.type,
      parsed: prep,
    },
    {
      upsert: true,
      returnDocument: 'after',
    },
  );
}
