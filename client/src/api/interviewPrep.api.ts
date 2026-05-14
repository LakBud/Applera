import { client } from "./client";
import { InterviewPrepSchema, type InterviewPrep } from "./schemas";

// POST /api/interview/:applicationId
export async function generateInterviewPrep(applicationId: string): Promise<InterviewPrep> {
  const res = await client.post<{ prep: unknown }>(`/api/interview/${applicationId}`);

  return InterviewPrepSchema.parse(res.data.prep);
}

// GET /api/interview/:applicationId
export async function getInterviewPrep(applicationId: string): Promise<InterviewPrep> {
  const res = await client.get<{ prep: unknown }>(`/api/interview/${applicationId}`);

  return InterviewPrepSchema.parse(res.data.prep);
}
