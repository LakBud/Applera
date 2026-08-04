import { VernLLM, fromGroq } from 'vern-llm';

import { IS_PROD } from '../../config/env.js';
import { model, openai } from '../../config/openai.js';
import { UpstashCacheAdapter } from '../../lib/cache.js';

export const llm = new VernLLM({
  client: fromGroq(openai),
  model,
  cache: new UpstashCacheAdapter(),
  debug: !IS_PROD,
  circuitBreaker: true,

  onUsage: ({ requestId, model: usedModel, promptTokens, completionTokens, totalTokens }) => {
    console.info(
      `[llm:${requestId}] ${usedModel} — ${promptTokens} in / ${completionTokens} out / ${totalTokens} total`,
    );
  },
});
