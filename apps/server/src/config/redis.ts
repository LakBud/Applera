import { Redis } from '@upstash/redis';

import { UPSTASH_REDIS_REST_TOKEN, UPSTASH_REDIS_REST_URL } from './env.js';

export const redis = new Redis({
  url: UPSTASH_REDIS_REST_URL,
  token: UPSTASH_REDIS_REST_TOKEN,
  automaticDeserialization: false,
});
