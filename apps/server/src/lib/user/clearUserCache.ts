import { Types } from 'mongoose';

import { AggregateError } from '../../utils/errors/aggregate.error.js';
import { deleteCache, deleteCachePattern } from '../cache.js';

export async function clearUserCache(clerkId: string, applicationIds: Types.ObjectId[]) {
  const results = await Promise.allSettled([
    deleteCachePattern(`cv:hash:${clerkId}:*`),
    deleteCachePattern(`cvs:${clerkId}:*`),
    deleteCachePattern(`usage:${clerkId}`),
    deleteCachePattern(`rl:*:user:${clerkId}`),

    ...applicationIds.map((id) => deleteCache(`interview:${id.toString()}`)),

    ...applicationIds.map((id) => deleteCachePattern(`application:*${id.toString()}*`)),

    deleteCachePattern(`*${clerkId}*`),
  ]);

  const rejected = results.filter(
    (result): result is PromiseRejectedResult => result.status === 'rejected',
  );

  if (rejected.length > 0) {
    throw new AggregateError(
      rejected.map((result) => result.reason),
      `Failed to invalidate ${rejected.length} of ${results.length} cache entr${
        rejected.length === 1 ? 'y' : 'ies'
      } for user ${clerkId}`,
    );
  }
}
