import { randomUUID } from 'crypto';

import { IS_PROD } from '../../config/env.js';
import { model, openai } from '../../config/openai.js';
import { getCache, setCache } from '../../lib/cache.js';
import parseModelJson from '../../lib/parseModelJson.js';

import type { RefundUsage, ReserveUsage } from '../../types/llm.types.js';

const BASE_DELAY_MS = 500;

// Error class
export class LLMError extends Error {
  constructor(
    message: string,
    public type: 'timeout' | 'api' | 'parse' | 'unknown' | 'aborted',
  ) {
    super(message);
  }
}
// Timeout wrapper
const MAX_RETRIES = 1; // 2 attempts max
const TIMEOUT_MS = 25_000; // 25s per attempt → ~52s worst case, well under 90s

/**
 * Combines the caller's external signal (request-level deadline) with a
 * per-attempt timeout, so whichever fires first cancels the call.
 */
async function withTimeout<T>(
  fn: (signal: AbortSignal) => Promise<T>,
  ms: number,
  externalSignal?: AbortSignal,
): Promise<T> {
  const timeoutController = new AbortController();
  const timeout = setTimeout(() => timeoutController.abort(), ms);

  const signal = externalSignal
    ? AbortSignal.any([externalSignal, timeoutController.signal])
    : timeoutController.signal;

  try {
    return await fn(signal);
  } finally {
    clearTimeout(timeout);
  }
}

// Debug logger (safe in dev only)
function debugLog(label: string, content: unknown, requestId: string): void {
  if (IS_PROD) {
    return;
  }

  const safe = typeof content === 'string' ? content : JSON.stringify(content, null, 2);

  console.debug(`\n[llm:${requestId}] ${label}:\n${safe.slice(0, 800)}\n`);
}

// ─────────────────────────────────────────────
// Main LLM call (RAW JSON)
// ─────────────────────────────────────────────

type CallLLMParams = {
  systemPrompt: string;
  userContent: string;
  temperature?: number;
  jsonMode?: boolean;
  maxTokens?: number;
  requestId?: string;
  signal?: AbortSignal;
};

export async function callLLM({
  systemPrompt,
  userContent,
  temperature = 0.2,
  jsonMode = true,
  maxTokens = 1000,
  requestId = randomUUID(),
  signal,
}: CallLLMParams): Promise<unknown> {
  let lastError: unknown;

  const totalAttempts = MAX_RETRIES + 1;

  for (let attempt = 0; attempt < totalAttempts; attempt++) {
    if (signal?.aborted) {
      throw new LLMError(`Aborted before attempt ${attempt + 1}`, 'aborted');
    }

    try {
      if (attempt > 0) {
        const delay = BASE_DELAY_MS * 2 ** attempt;

        console.warn(`[llm:${requestId}] retry ${attempt}/${MAX_RETRIES} in ${delay}ms`);

        await new Promise<void>((resolve) => {
          const timer = setTimeout(resolve, delay);
          signal?.addEventListener(
            'abort',
            () => {
              clearTimeout(timer);
              resolve();
            },
            { once: true },
          );
        });
      }

      const response = await withTimeout(
        (attemptSignal) =>
          openai.chat.completions.create(
            {
              model,
              temperature,
              max_tokens: maxTokens,
              ...(jsonMode ? { response_format: { type: 'json_object' } } : {}),
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userContent },
              ],
            },
            { signal: attemptSignal },
          ),
        TIMEOUT_MS,
        signal,
      );

      const content = response.choices?.[0]?.message?.content?.trim();

      if (!content) {
        throw new LLMError('Empty response', 'api');
      }

      debugLog('raw output', content, requestId);

      const parsed = parseModelJson(content);

      if (!parsed) {
        throw new LLMError('Parse failed', 'parse');
      }

      return parsed;
    } catch (err) {
      lastError = err;

      if (err instanceof LLMError && err.type === 'parse') {
        break;
      }

      // External deadline/disconnect — stop retrying, no point burning the
      // remaining attempt on a request that's already dead.
      if (signal?.aborted) {
        break;
      }
    }
  }

  if (signal?.aborted) {
    throw new LLMError('LLM call aborted (timeout or disconnect)', 'aborted');
  }

  throw new LLMError(
    `LLM failed after ${totalAttempts} attempts: ${lastError instanceof Error ? lastError.message : 'unknown'}`,
    'unknown',
  );
}

export async function cachedLLM<T>({
  cacheKey,
  ttl,
  fn,
  reserveUsage,
  refundUsage,
}: {
  cacheKey: string;
  ttl: number;
  fn: () => Promise<T>;
  reserveUsage?: ReserveUsage;
  refundUsage?: RefundUsage;
}): Promise<T> {
  const cached = await getCache<T>(cacheKey);

  if (cached) {
    return cached;
  }

  try {
    await reserveUsage?.();
    const result = await fn();
    try {
      await setCache(cacheKey, result, ttl);
    } catch (cacheError) {
      console.error('[cachedLLM] Cache write failed', {
        message: cacheError instanceof Error ? cacheError.message : 'Unknown error',
      });
    }
    return result;
  } catch (err) {
    try {
      await refundUsage?.();
    } catch (refundErr) {
      console.error('[cachedLLM] Refund failed', {
        message: refundErr instanceof Error ? refundErr.message : 'Unknown error',
      });
    }
    throw err;
  }
}
