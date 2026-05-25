import { redis } from "../integrations/redis.js";

// ─────────────────────────────────────────────
// GET CACHE
// ─────────────────────────────────────────────

export async function getCache<T>(key: string): Promise<T | null> {
  const value = await redis.get<string | T>(key);

  if (!value) return null;

  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as unknown as T;
    }
  }

  return value as T;
}

// ─────────────────────────────────────────────
// SET CACHE
// ─────────────────────────────────────────────

export async function setCache<T>(key: string, value: T, ttlSeconds = 60 * 60) {
  await redis.set(key, JSON.stringify(value), {
    ex: ttlSeconds,
  });
}

// ─────────────────────────────────────────────
// DELETE CACHE
// ─────────────────────────────────────────────

export async function deleteCache(key: string) {
  await redis.del(key);
}
