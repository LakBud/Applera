import { VernLLM, fromGroq, fromMistral } from 'vern-llm';

import {
  GROQ_MAX_CONCURRENT,
  GROQ_REQUESTS_PER_MINUTE,
  GROQ_TOKENS_PER_MINUTE,
  IS_PROD,
  MISTRAL_MAX_CONCURRENT,
  MISTRAL_REQUESTS_PER_MINUTE,
  MISTRAL_TOKENS_PER_MINUTE,
} from '../../config/env.js';
import { groq, groq_model } from '../../config/groq.js';
import { mistral, mistralModel } from '../../config/mistral.js';
import { UpstashCacheAdapter } from '../../lib/cache.js';

export const llm = new VernLLM({
  name: 'mistral',
  client: fromMistral(mistral),
  model: mistralModel,
  cache: new UpstashCacheAdapter(),
  debug: !IS_PROD,
  circuitBreaker: true,

  // A provider occasionally returns a 400 for a JSON generation failure (e.g. Groq's
  // json_validate_failed) that's a transient generation issue, not a genuinely malformed
  // request, and is usually fine on a retry. So 400 is dropped from the default non-retryable
  // list.
  nonRetryableStatus: [401, 403, 404, 422],

  // Proactively stays under Mistral's request/token/concurrency limits instead of firing calls
  // and reacting to 429s after the fact.
  rateLimit: {
    requestsPerMinute: MISTRAL_REQUESTS_PER_MINUTE,
    tokensPerMinute: MISTRAL_TOKENS_PER_MINUTE,
    maxConcurrent: MISTRAL_MAX_CONCURRENT,
  },

  fallback: {
    name: 'groq',
    client: fromGroq(groq),
    model: groq_model,
    circuitBreaker: true,
    rateLimit: {
      requestsPerMinute: GROQ_REQUESTS_PER_MINUTE,
      tokensPerMinute: GROQ_TOKENS_PER_MINUTE,
      maxConcurrent: GROQ_MAX_CONCURRENT,
    },
  },

  onUsage: ({ requestId, model: usedModel, promptTokens, completionTokens, totalTokens }) => {
    console.info(
      `[llm:${requestId}] ${usedModel} — ${promptTokens} in / ${completionTokens} out / ${totalTokens} total`,
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
