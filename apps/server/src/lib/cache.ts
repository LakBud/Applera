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

import type { CacheAdapter, EvictionOption } from 'vern-llm';

/**
 * Redis-backed `CacheAdapter` for VernLLM's `cachedCall`. Values expire via
 * Redis `EX` same as before. On top of that, a sorted set (`indexKey`) tracks
 * every live cache key by insertion or last-access time, so the cache can be
 * capped at `maxSize` — Redis alone has no notion of "oldest N app-level
 * keys" without configuring server-side `maxmemory-policy`, which isn't
 * available on Upstash's managed tier. `'fifo'` (default) evicts by
 * insertion order; `'lru'` re-scores on every hit so a key that keeps
 * getting read survives even after `maxSize` is reached.
 */
export class UpstashCacheAdapter<T = unknown> implements CacheAdapter<T> {
  private readonly indexKey: string;

  constructor(
    private readonly maxSize = 1000,
    private readonly eviction: EvictionOption = 'fifo',
    keyPrefix = 'vernllm:cache',
  ) {
    this.indexKey = `${keyPrefix}:__index`;
  }

  async get(key: string): Promise<{ hit: boolean; value: T | null }> {
    const raw = await redis.get<string>(key);

    if (raw === null || raw === undefined) {
      // Key expired via Redis TTL without going through `delete()`, so the
      // index entry is now stale — drop it lazily rather than scanning for
      // expired entries proactively.
      await redis.zrem(this.indexKey, key);
      return { hit: false, value: null };
    }

    if (this.eviction === 'lru') {
      await redis.zadd(this.indexKey, { score: Date.now(), member: key });
    }

    try {
      return { hit: true, value: JSON.parse(raw) as T };
    } catch {
      return { hit: false, value: null };
    }
  }

  async set(key: string, value: T, ttl: number): Promise<void> {
    await redis.set(key, JSON.stringify(value), { ex: ttl });
    await redis.zadd(this.indexKey, { score: Date.now(), member: key });
    await this.enforceSizeLimit();
  }

  async delete(key: string): Promise<void> {
    await Promise.all([redis.del(key), redis.zrem(this.indexKey, key)]);
  }

  /** Evicts the oldest (fifo) or least-recently-touched (lru) entries once the index exceeds `maxSize`. */
  private async enforceSizeLimit(): Promise<void> {
    const size = await redis.zcard(this.indexKey);
    const excess = size - this.maxSize;
    if (excess <= 0) return;

    // Sorted set is scored oldest-first (fifo insertion time, or lru last-touch
    // time), so the lowest `excess` ranks are always the correct eviction set.
    const victims = await redis.zrange<string[]>(this.indexKey, 0, excess - 1);
    if (victims.length === 0) return;

    await Promise.all([redis.del(...victims), redis.zrem(this.indexKey, ...victims)]);
  }
}
