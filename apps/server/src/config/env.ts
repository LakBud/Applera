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
