import { client } from "./client";
import { InterviewPrepSchema } from "./schemas";
import type { InterviewPrep } from "./types";

// ── Generate interview prep ─────────────────────────────────────
export async function generateInterviewPrep(applicationId: string) {
  const res = await client.post<{ prep: InterviewPrep }>("/api/interview/generate", { applicationId });

  return {
    ...res.data,
    prep: InterviewPrepSchema.parse(res.data.prep),
  };
}

// ── Get interview prep ──────────────────────────────────────────
export async function getInterviewPrep(applicationId: string) {
  const res = await client.get<{ prep: InterviewPrep }>(`/api/interview/${applicationId}`);

  return {
    ...res.data,
    prep: InterviewPrepSchema.parse(res.data.prep),
  };
}
