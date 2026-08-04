import { VernLLM, fromGroq, isLLMError, type ReserveUsage, type RefundUsage } from 'vern-llm';

import { IS_PROD } from '../../config/env.js';
import { model, openai } from '../../config/openai.js';
import { UpstashCacheAdapter } from '../../lib/cache.js';

import type { ZodType } from 'zod';

export const llm = new VernLLM({
  client: fromGroq(openai),
  model,
  cache: new UpstashCacheAdapter(),
  debug: !IS_PROD,

  onUsage: ({ requestId, model: usedModel, promptTokens, completionTokens, totalTokens }) => {
    console.info(
      `[llm:${requestId}] ${usedModel} — ${promptTokens} in / ${completionTokens} out / ${totalTokens} total`,
    );
  },
});

type CallLLMParams<T = unknown> = {
  systemPrompt: string;
  userContent: string;
  temperature?: number;
  jsonMode?: boolean;
  maxTokens?: number;
  requestId?: string;
  signal?: AbortSignal;
  schema?: ZodType<T>;
};

export async function callLLM<T = unknown>(params: CallLLMParams<T>): Promise<T> {
  return llm.call<T>(params);
}

export async function cachedLLM<T>({
  cacheKey,
  ttl,
  call,
  reserveUsage,
  refundUsage,
}: {
  cacheKey: string;
  ttl: number;
  call: CallLLMParams<T>;
  reserveUsage?: ReserveUsage;
  refundUsage?: RefundUsage;
}): Promise<T> {
  return llm.cachedLLMCall<T>({
    cacheKey,
    ttl,
    call,
    reserveUsage,
    refundUsage,
  });
}

/**
 * Generic cache wrapper for operations that aren't a single LLM call — e.g.
 * local computation plus a conditional nested LLM call. Put any llm.call()
 * invocations inside `fn` yourself so they still get retry/timeout/circuit
 * breaker behavior; this wrapper only handles caching + coalescing + usage
 * hooks around whatever `fn` returns.
 */
export async function cachedCall<T>({
  cacheKey,
  ttl,
  fn,
  signal,
  reserveUsage,
  refundUsage,
}: {
  cacheKey: string;
  ttl: number;
  fn: () => Promise<T>;
  signal?: AbortSignal;
  reserveUsage?: ReserveUsage;
  refundUsage?: RefundUsage;
}): Promise<T> {
  return llm.cachedCall<T>({
    cacheKey,
    ttl,
    fn,
    signal,
    reserveUsage,
    refundUsage,
  });
}

export { isLLMError };
