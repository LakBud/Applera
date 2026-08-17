import { getCache, setCache } from '../../lib/cache.js';
import CVModel from '../../models/CV.js';

export const cvHashKey = (userId: string, hash: string) => `cv:hash:${userId}:${hash}`;
export const cvListKey = (userId: string, type: string) => `cvs:${userId}:${type}`;

export function isMongoError(err: unknown): err is { code: number } {
  return typeof err === 'object' && err !== null && 'code' in err;
}

// Cache-then-DB dedupe lookup, used to short-circuit re-parsing an identical CV.
export async function findExistingCV(ownerId: string, contentHash: string) {
  const cacheKey = cvHashKey(ownerId, contentHash);

  const cached = await getCache(cacheKey);
  if (cached) {
    return cached;
  }

  const existing = await CVModel.findOne({ ownerId, contentHash });
  if (existing) {
    await setCache(cacheKey, existing, 60 * 10);
    return existing;
  }

  return null;
}
