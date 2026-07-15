import { Types } from 'mongoose';

import { deleteCache, deleteCachePattern } from '../cache.js';

export async function clearUserCache(clerkId: string, applicationIds: Types.ObjectId[]) {
  await Promise.allSettled([
    deleteCachePattern(`cv:hash:${clerkId}:*`),
    deleteCachePattern(`cvs:${clerkId}:*`),
    deleteCachePattern(`usage:${clerkId}`),
    deleteCachePattern(`rl:*:user:${clerkId}`),

    ...applicationIds.map((id) => deleteCache(`interview:${id.toString()}`)),

    ...applicationIds.map((id) => deleteCachePattern(`application:*${id.toString()}*`)),

    deleteCachePattern(`*${clerkId}*`),
  ]);
}
