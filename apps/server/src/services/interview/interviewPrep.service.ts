import {
  InterviewPrepParsedSchema,
  type CVParsed,
  type InterviewPrepParsed,
  type JobParsed,
} from '@applera/schemas';

import { CACHE_VERSIONS } from '../../config/cache.versions.js';
import { INTERVIEW_PREP_PROMPT } from '../../prompts/interview/interviewPrep.system.js';
import { buildInterviewPrepPrompt } from '../../prompts/interview/interviewPrep.user.js';
import { cachedLLM, callLLM } from '../llm/llm.service.js';

import type { LLMExecutionOptions } from '../../types/llm.types.js';
import type { MatchReport } from '../../types/schemas/match.schemas.js';

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
  applicationId: string,
  { signal, reserveUsage }: LLMExecutionOptions = {},
): Promise<InterviewPrepOutput> {
  signal?.throwIfAborted();

  return cachedLLM<InterviewPrepParsed>({
    cacheKey: `interview:${CACHE_VERSIONS.interview}:${applicationId}`,
    ttl: INTERVIEW_TTL,
    reserveUsage,

    fn: async () => {
      const result = await callLLM({
        systemPrompt: INTERVIEW_PREP_PROMPT,
        userContent: buildInterviewPrepPrompt(cv, job, match, rawText),
        temperature: 0.3,
        maxTokens: 1500,
        signal,
      });

      return InterviewPrepParsedSchema.parse(result);
    },
  });
}
