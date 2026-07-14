import { CACHE_VERSIONS } from '../../config/cache.versions.js';
import { INTERVIEW_PREP_PROMPT } from '../../prompts/interview/interviewPrep.system.js';
import { buildInterviewPrepPrompt } from '../../prompts/interview/interviewPrep.user.js';
import { cachedLLM, callLLM } from '../llm/llm.service.js';

import type { MatchReport } from '../../types/schemas/match.schemas.js';
import type { CVParsed, JobParsed } from '@applera/schemas';

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
  cv: CVParsed,
  job: JobParsed,
  rawText: string | null | undefined,
  match: MatchReport,
  applicationId: string, // used as cache key
): Promise<InterviewPrepOutput> {
  return cachedLLM<InterviewPrepOutput>({
    cacheKey: `interview:${CACHE_VERSIONS.interview}:${applicationId}`,
    ttl: INTERVIEW_TTL,
    fn: () =>
      callLLM({
        systemPrompt: INTERVIEW_PREP_PROMPT,
        userContent: buildInterviewPrepPrompt(cv, job, match, rawText),
        temperature: 0.3,
        maxTokens: 1500,
      }) as Promise<InterviewPrepOutput>,
  });
}
