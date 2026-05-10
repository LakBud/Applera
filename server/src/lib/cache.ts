import { redis } from "./redis.js";

export async function getCache<T>(key: string): Promise<T | null> {
  const value = await redis.get(key);
  return value as T | null;
}

export async function setCache<T>(key: string, value: T, ttlSeconds = 60 * 60) {
  await redis.set(key, value, { ex: ttlSeconds });
}
