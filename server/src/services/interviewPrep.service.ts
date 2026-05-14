import { callLLM, cachedLLM } from "./llm/llm.service.js";
import { INTERVIEW_PREP_PROMPT } from "../prompts/interviewPrepPrompt.js";

const INTERVIEW_TTL = 60 * 60 * 24; // 24 hours — questions don't change unless regenerated

interface InterviewPrepOutput {
  questions: {
    category: string;
    question: string;
    tip: string;
  }[];
  general_tips: string[];
}

export async function generateInterviewPrep(
  cv: object,
  job: object,
  match: object,
  applicationId: string, // used as cache key
): Promise<InterviewPrepOutput> {
  return cachedLLM<InterviewPrepOutput>({
    cacheKey: `interview:${applicationId}`,
    ttl: INTERVIEW_TTL,
    fn: () =>
      callLLM({
        systemPrompt: INTERVIEW_PREP_PROMPT,
        userContent: [
          "CV:",
          JSON.stringify(cv, null, 2),
          "",
          "JOB:",
          JSON.stringify(job, null, 2),
          "",
          "MATCH:",
          JSON.stringify(match, null, 2),
        ].join("\n"),
        temperature: 0.4,
        maxTokens: 3000,
      }) as Promise<InterviewPrepOutput>,
  });
}
