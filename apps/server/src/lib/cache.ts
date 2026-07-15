import { redis } from '../config/redis.js';

// Get Caches
export async function getCache<T>(key: string): Promise<T | null> {
  const value = await redis.get<string | T>(key);

  if (!value) {
    return null;
  }

  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as unknown as T;
    }
  }

  return value as T;
}

// Set Caches
export async function setCache<T>(key: string, value: T, ttlSeconds = 60 * 60) {
  await redis.set(key, JSON.stringify(value), {
    ex: ttlSeconds,
  });
}

// Delete Caches
export async function deleteCache(key: string) {
  await redis.del(key);
}

export async function deleteCachePattern(pattern: string) {
  let cursor = '0';
  const allKeys: string[] = [];

  do {
    const [nextCursor, keys] = await redis.scan(cursor, { match: pattern, count: 100 });

    allKeys.push(...keys);
    cursor = nextCursor;
  } while (cursor !== '0');

  if (allKeys.length > 0) {
    await redis.del(...allKeys);
  }
}
