import dotenv from 'dotenv';

const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';

dotenv.config({ path: envFile });

function requireEnv(key: string) {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function optionalEnv(key: string, fallback: string): string {
  return process.env[key] || fallback;
}

// ── Environment ───────────────────────────────────────────────────────────────

export const IS_PROD = optionalEnv('NODE_ENV', 'development') === 'production';

// ── AI (Groq, fallback provider) ─────────────────────────────────────────────

export const GROQ_API_KEY = requireEnv('GROQ_API_KEY');
export const GROQ_BASE_URL = 'https://api.groq.com/openai/v1';
export const GROQ_MODEL = optionalEnv('GROQ_MODEL', 'qwen/qwen3.6-27b');

// Local, proactive request/token/concurrency caps applied before a call ever reaches Groq.
// Tune these to match your Groq plan's actual limits.
export const GROQ_REQUESTS_PER_MINUTE = Number(optionalEnv('GROQ_REQUESTS_PER_MINUTE', '250'));
export const GROQ_TOKENS_PER_MINUTE = Number(optionalEnv('GROQ_TOKENS_PER_MINUTE', '150000'));
export const GROQ_MAX_CONCURRENT = Number(optionalEnv('GROQ_MAX_CONCURRENT', '20'));

// ── AI (Mistral, primary provider) ───────────────────────────────────────────

export const MISTRAL_API_KEY = requireEnv('MISTRAL_API_KEY');
export const MISTRAL_BASE_URL = 'https://api.mistral.ai/v1';
export const MISTRAL_MODEL = optionalEnv('MISTRAL_MODEL', 'mistral-small-latest');

// Local, proactive request/token/concurrency caps applied before a call ever reaches Mistral.
// Tune these to match your Mistral plan's actual limits.
export const MISTRAL_REQUESTS_PER_MINUTE = Number(
  optionalEnv('MISTRAL_REQUESTS_PER_MINUTE', '250'),
);
export const MISTRAL_TOKENS_PER_MINUTE = Number(optionalEnv('MISTRAL_TOKENS_PER_MINUTE', '150000'));
export const MISTRAL_MAX_CONCURRENT = Number(optionalEnv('MISTRAL_MAX_CONCURRENT', '20'));

// ── AI (VernLLM tuning) ───────────────────────────────────────────────────────

export const LLM_MAX_RETRIES = Number(optionalEnv('LLM_MAX_RETRIES', '3'));
export const LLM_TIMEOUT_MS = Number(optionalEnv('LLM_TIMEOUT_MS', '15000'));
export const LLM_DEFAULT_MAX_TOKENS = Number(optionalEnv('LLM_DEFAULT_MAX_TOKENS', '1200'));
export const LLM_DEFAULT_TEMPERATURE = Number(optionalEnv('LLM_DEFAULT_TEMPERATURE', '0.2'));

// Retry budget: once >= minCalls land in the trailing window and the retry ratio
// crosses retryRatio, further retries against that target fail fast instead of
// piling onto an already-struggling provider.
export const LLM_RETRY_BUDGET_WINDOW_MS = Number(
  optionalEnv('LLM_RETRY_BUDGET_WINDOW_MS', '60000'),
);
export const LLM_RETRY_BUDGET_MIN_CALLS = Number(optionalEnv('LLM_RETRY_BUDGET_MIN_CALLS', '20'));
export const LLM_RETRY_BUDGET_RATIO = Number(optionalEnv('LLM_RETRY_BUDGET_RATIO', '0.3'));

// AIMD (additive-increase/multiplicative-decrease) against the requests-per-minute
// ceiling: creeps the ceiling up on clean releases, and cuts it down hard on a real
// 429 (or proactively, once a provider hint reports we're close to its own limit).
export const LLM_AIMD_INCREASE_BY = Number(optionalEnv('LLM_AIMD_INCREASE_BY', '5'));
export const LLM_AIMD_DECREASE_FACTOR = Number(optionalEnv('LLM_AIMD_DECREASE_FACTOR', '0.5'));
export const LLM_AIMD_PROACTIVE_FLOOR = Number(optionalEnv('LLM_AIMD_PROACTIVE_FLOOR', '5'));

// Circuit breaker: opens after repeated failures, backs off cooldown on repeat
// opens, and requires more than one clean probe before fully closing again.
export const LLM_CIRCUIT_THRESHOLD = Number(optionalEnv('LLM_CIRCUIT_THRESHOLD', '5'));
export const LLM_CIRCUIT_COOLDOWN_MS = Number(optionalEnv('LLM_CIRCUIT_COOLDOWN_MS', '30000'));
export const LLM_CIRCUIT_COOLDOWN_MULTIPLIER = Number(
  optionalEnv('LLM_CIRCUIT_COOLDOWN_MULTIPLIER', '2'),
);
export const LLM_CIRCUIT_COOLDOWN_MAX_MS = Number(
  optionalEnv('LLM_CIRCUIT_COOLDOWN_MAX_MS', '300000'),
);
export const LLM_CIRCUIT_HALF_OPEN_PROBES = Number(
  optionalEnv('LLM_CIRCUIT_HALF_OPEN_PROBES', '3'),
);
export const LLM_CIRCUIT_HALF_OPEN_SUCCESS_RATIO = Number(
  optionalEnv('LLM_CIRCUIT_HALF_OPEN_SUCCESS_RATIO', '0.7'),
);

// Caps how many entries the Upstash-backed cache tracks. 'fifo' evicts the
// oldest inserted key once the cap is hit; 'lru' evicts whichever key was
// least recently read or written instead.
export const LLM_CACHE_MAX_SIZE = Number(optionalEnv('LLM_CACHE_MAX_SIZE', '5000'));
export const LLM_CACHE_EVICTION = optionalEnv('LLM_CACHE_EVICTION', 'lru') as 'fifo' | 'lru';

// ── Auth (Clerk) ──────────────────────────────────────────────────────────────

export const COOKIE_SECRET = requireEnv('COOKIE_SECRET');
export const CLERK_SECRET_KEY = requireEnv('CLERK_SECRET_KEY');
export const CLERK_PUBLISHABLE_KEY = requireEnv('CLERK_PUBLISHABLE_KEY');

export const CLERK_WEBHOOK_SECRET = IS_PROD
  ? requireEnv('CLERK_WEBHOOK_SECRET')
  : optionalEnv('CLERK_WEBHOOK_SECRET', '');

// ── Server ────────────────────────────────────────────────────────────────────

export const PORT = optionalEnv('PORT', '5005');
export const CLIENT_URL = IS_PROD
  ? requireEnv('CLIENT_URL')
  : optionalEnv('CLIENT_URL', 'http://localhost:5173');

// ── Database ──────────────────────────────────────────────────────────────────

export const MONGO_URI = requireEnv('MONGO_URI');

// ── Redis (Upstash) ───────────────────────────────────────────────────────────

export const UPSTASH_REDIS_REST_URL = requireEnv('UPSTASH_REDIS_REST_URL');
export const UPSTASH_REDIS_REST_TOKEN = requireEnv('UPSTASH_REDIS_REST_TOKEN');

// ── Cloudinary ────────────────────────────────────────────────────────────────

export const CLOUDINARY_CLOUD_NAME = requireEnv('CLOUDINARY_CLOUD_NAME');
export const CLOUDINARY_API_KEY = requireEnv('CLOUDINARY_API_KEY');
export const CLOUDINARY_API_SECRET = requireEnv('CLOUDINARY_API_SECRET');
