import { redis } from "./redis.js";

// ─────────────────────────────────────────────
// GET CACHE
// ─────────────────────────────────────────────

export async function getCache<T>(key: string): Promise<T | null> {
  const value = await redis.get<string>(key);

  if (!value) return null;

  try {
    return JSON.parse(value) as T;
  } catch {
    return value as unknown as T;
  }
}

// ─────────────────────────────────────────────
// SET CACHE
// ─────────────────────────────────────────────

export async function setCache<T>(key: string, value: T, ttlSeconds = 60 * 60) {
  await redis.set(key, JSON.stringify(value), {
    ex: ttlSeconds,
  });
}
