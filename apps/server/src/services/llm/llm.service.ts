import { defaultFallbackOn, VernLLM, fromGroq, fromMistral, type FallbackOn } from 'vern-llm';

import {
  GROQ_MAX_CONCURRENT,
  GROQ_REQUESTS_PER_MINUTE,
  GROQ_TOKENS_PER_MINUTE,
  IS_PROD,
  LLM_AIMD_DECREASE_FACTOR,
  LLM_AIMD_INCREASE_BY,
  LLM_AIMD_PROACTIVE_FLOOR,
  LLM_CACHE_EVICTION,
  LLM_CACHE_MAX_SIZE,
  LLM_CIRCUIT_COOLDOWN_MAX_MS,
  LLM_CIRCUIT_COOLDOWN_MS,
  LLM_CIRCUIT_COOLDOWN_MULTIPLIER,
  LLM_CIRCUIT_HALF_OPEN_PROBES,
  LLM_CIRCUIT_HALF_OPEN_SUCCESS_RATIO,
  LLM_CIRCUIT_THRESHOLD,
  LLM_DEFAULT_MAX_TOKENS,
  LLM_DEFAULT_TEMPERATURE,
  LLM_MAX_RETRIES,
  LLM_RETRY_BUDGET_MIN_CALLS,
  LLM_RETRY_BUDGET_RATIO,
  LLM_RETRY_BUDGET_WINDOW_MS,
  LLM_TIMEOUT_MS,
  MISTRAL_MAX_CONCURRENT,
  MISTRAL_REQUESTS_PER_MINUTE,
  MISTRAL_TOKENS_PER_MINUTE,
} from '../../config/env.js';
import { groq, groq_model } from '../../config/groq.js';
import { mistral, mistralModel } from '../../config/mistral.js';
import { UpstashCacheAdapter } from '../../lib/cache.js';

// Grows the requests-per-minute ceiling by `increaseBy` on every clean release,
// and cuts it to `decreaseFactor` of its current size on a real 429 — or
// proactively, once a provider hint reports remaining requests at or below
// `proactiveFloor`, before a 429 ever happens. `requestsPerMinute` stays the
// ceiling this can grow back up to; it never grows past it.
const buildAimd = (requestsPerMinute: number) => ({
  increaseBy: LLM_AIMD_INCREASE_BY,
  decreaseFactor: LLM_AIMD_DECREASE_FACTOR,
  minCapacity: Math.max(1, Math.round(requestsPerMinute * 0.1)),
  maxCapacity: requestsPerMinute,
  proactiveFloor: LLM_AIMD_PROACTIVE_FLOOR,
});

// Every call in this app is schema-validated JSON (see `cachedCall` usages),
// so `defaultFallbackOn` already does the right thing: it stops on
// `parse`/`validation` errors, since a response that failed our own schema is
// a model-output problem a different provider is just as likely to repeat,
// not something worth spending a second provider's quota on. This also stops
// on `invalid_params` — a malformed request shape is our bug, and Groq would
// reject the identical payload the same way Mistral just did.
const fallbackOnSchemaAwarePolicy: FallbackOn = (error, context) => {
  if (error.type === 'invalid_params') return 'stop';
  return defaultFallbackOn(error, context);
};

const sharedTuning = {
  maxRetries: LLM_MAX_RETRIES,
  timeoutMs: LLM_TIMEOUT_MS,
  defaultMaxTokens: LLM_DEFAULT_MAX_TOKENS,
  defaultTemperature: LLM_DEFAULT_TEMPERATURE,

  circuitBreaker: {
    threshold: LLM_CIRCUIT_THRESHOLD,
    cooldownMs: LLM_CIRCUIT_COOLDOWN_MS,
    // Doubles the cooldown on each repeat open (capped), so a provider stuck
    // down doesn't get hammered with a trial request every fixed 30s forever.
    cooldownBackoff: {
      multiplier: LLM_CIRCUIT_COOLDOWN_MULTIPLIER,
      maxMs: LLM_CIRCUIT_COOLDOWN_MAX_MS,
    },
    // Several clean probes, most of them successful, before fully closing —
    // one lucky request shouldn't be enough to declare a flaky provider healthy.
    halfOpenProbes: LLM_CIRCUIT_HALF_OPEN_PROBES,
    halfOpenSuccessRatio: LLM_CIRCUIT_HALF_OPEN_SUCCESS_RATIO,
    isolateByModel: true,
  },

  // Once >= minCalls land in the trailing window and the retry ratio crosses
  // retryRatio, further retries against that target fail fast instead of
  // piling onto an already-struggling provider.
  retryBudget: {
    windowMs: LLM_RETRY_BUDGET_WINDOW_MS,
    minCalls: LLM_RETRY_BUDGET_MIN_CALLS,
    retryRatio: LLM_RETRY_BUDGET_RATIO,
  },

  // A provider occasionally returns a 400 for a JSON generation failure (e.g. Groq's
  // json_validate_failed) that's a transient generation issue, not a genuinely malformed
  // request, and is usually fine on a retry. So 400 is dropped from the default non-retryable
  // list.
  nonRetryableStatus: [401, 403, 404, 422],
};

export const llm = new VernLLM({
  name: 'mistral',
  client: fromMistral(mistral),
  model: mistralModel,
  cache: new UpstashCacheAdapter(LLM_CACHE_MAX_SIZE, LLM_CACHE_EVICTION),
  debug: !IS_PROD,
  fallbackOn: fallbackOnSchemaAwarePolicy,
  ...sharedTuning,

  // Proactively stays under Mistral's request/token/concurrency limits instead of firing calls
  // and reacting to 429s after the fact. AIMD lets the requests ceiling creep up when things
  // are healthy and snap back down the moment Mistral signals it's under pressure.
  rateLimit: {
    requestsPerMinute: MISTRAL_REQUESTS_PER_MINUTE,
    tokensPerMinute: MISTRAL_TOKENS_PER_MINUTE,
    maxConcurrent: MISTRAL_MAX_CONCURRENT,
    aimd: buildAimd(MISTRAL_REQUESTS_PER_MINUTE),
  },

  fallback: {
    name: 'groq',
    client: fromGroq(groq),
    model: groq_model,
    ...sharedTuning,
    rateLimit: {
      requestsPerMinute: GROQ_REQUESTS_PER_MINUTE,
      tokensPerMinute: GROQ_TOKENS_PER_MINUTE,
      maxConcurrent: GROQ_MAX_CONCURRENT,
      aimd: buildAimd(GROQ_REQUESTS_PER_MINUTE),
    },
  },

  onUsage: ({ requestId, model: usedModel, promptTokens, completionTokens, totalTokens }) => {
    console.info(
      `[llm:${requestId}] ${usedModel} — ${promptTokens} in / ${completionTokens} out / ${totalTokens} total`,
    );
  },

  // Fires when a provider response comes back (so real spend already happened)
  // but VernLLM's own post-processing then fails — e.g. malformed JSON, a bad
  // tool-call shape. Distinct from `onEvent`'s `retry`/`fallback` cases, which
  // cover transport-level failures where no usage was ever produced.
  onUsageFailure: (usage, error) => {
    console.error(
      `[llm:${usage.requestId}] ${usage.model} — usage recorded but response processing failed`,
      { provider: usage.provider, totalTokens: usage.totalTokens, error: error.code ?? error.type },
    );
  },

  onEvent: (event) => {
    switch (event.kind) {
      case 'retry':
        console.warn(`[llm:${event.requestId}] retry ${event.attempt}/${event.maxRetries}`, {
          model: event.model,
          error: event.error.code ?? event.error.type,
        });
        break;
      case 'circuit_state':
        console.warn(`[llm:circuit] ${event.provider}/${event.model} ${event.from} => ${event.to}`);
        break;
      case 'rate_limited':
        console.info(`[llm:${event.requestId}] queued ${event.waitedMs}ms for rate limit capacity`);
        break;
      case 'fallback':
        console.warn(`[llm:fallback] ${event.from} => ${event.to}`);
        break;
    }
  },
});

/**
 * Snapshot of both providers' circuit state, for a `/health` endpoint or an
 * internal dashboard. `getCircuitStates()` returns one entry per
 * model bucket actually seen so far (since both targets set
 * `isolateByModel: true`), so this is empty until at least one call has run.
 */
export function getLlmHealth() {
  return llm.getCircuitStates().map(({ provider, index, isFallback, isolateByModel, state }) => ({
    provider,
    index,
    isFallback,
    isolateByModel,
    state: state ?? 'unknown',
  }));
}
