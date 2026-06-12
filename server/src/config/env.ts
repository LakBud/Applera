import dotenv from 'dotenv';
dotenv.config();

function requireEnv(key: string) {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}

function optionalEnv(key: string, fallback: string): string {
  return process.env[key] || fallback;
}

// ── Environment ───────────────────────────────────────────────────────────────

export const IS_PROD = optionalEnv('NODE_ENV', 'development') === 'production';

// ── AI (Groq) ─────────────────────────────────────────────────────────────────

export const GROQ_API_KEY = requireEnv('GROQ_API_KEY');
export const GROQ_BASE_URL = 'https://api.groq.com/openai/v1';
export const GROQ_MODEL = optionalEnv('GROQ_MODEL', 'llama-3.3-70b-versatile');

// ── Auth (Clerk) ──────────────────────────────────────────────────────────────

export const GUEST_SECRET = requireEnv('GUEST_SECRET');
export const COOKIE_SECRET = requireEnv('COOKIE_SECRET');
export const CLERK_SECRET_KEY = requireEnv('CLERK_SECRET_KEY');
export const CLERK_PUBLISHABLE_KEY = requireEnv('CLERK_PUBLISHABLE_KEY');
export const CLERK_WEBHOOK_SECRET = requireEnv('CLERK_WEBHOOK_SECRET');

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
