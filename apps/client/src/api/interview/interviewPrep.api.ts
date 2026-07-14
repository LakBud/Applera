import { InterviewPrepResponseSchema, type InterviewPrep } from '@applera/schemas';

import { client } from '../client';

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
