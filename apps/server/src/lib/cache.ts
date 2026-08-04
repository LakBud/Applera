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

  do {
    const [nextCursor, keys] = await redis.scan(cursor, { match: pattern, count: 100 });
    if (keys.length > 0) {
      await redis.del(...keys);
    }
    cursor = nextCursor;
  } while (cursor !== '0');
}

import type { CacheAdapter } from 'vern-llm';

export class UpstashCacheAdapter<T = unknown> implements CacheAdapter<T> {
  async get(key: string): Promise<{ hit: boolean; value: T | null }> {
    const raw = await redis.get<string>(key);

    if (raw === null || raw === undefined) {
      return { hit: false, value: null };
    }

    try {
      return { hit: true, value: JSON.parse(raw) as T };
    } catch {
      return { hit: false, value: null };
    }
  }

  async set(key: string, value: T, ttl: number): Promise<void> {
    await redis.set(key, JSON.stringify(value), { ex: ttl });
  }

  async delete(key: string): Promise<void> {
    await redis.del(key);
  }
}
