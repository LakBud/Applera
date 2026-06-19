import { type InterviewPrep } from '@repo/schemas';

import { client } from '../client';
import { InterviewPrepResponseSchema } from './interviewPrep.schemas';

// POST /api/interview/:applicationId
export async function generateInterviewPrep(applicationId: string): Promise<InterviewPrep> {
  const res = await client.post(`/api/interview/${applicationId}`);

  return InterviewPrepResponseSchema.parse(res.data).prep;
}

// GET /api/interview/:applicationId
export async function getInterviewPrep(applicationId: string): Promise<InterviewPrep> {
  const res = await client.get(`/api/interview/${applicationId}`);

  return InterviewPrepResponseSchema.parse(res.data).prep;
}
