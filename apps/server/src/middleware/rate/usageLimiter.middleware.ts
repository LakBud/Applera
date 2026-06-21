import { redis } from '../../config/redis.js';
import { getUsageLimit } from '../../utils/user/getUsageLimit.utils.js';
import { getUserId } from '../../utils/user/getUserId.utils.js';

import type { NextFunction, Request, Response } from 'express';

export async function usageLimiter(req: Request, res: Response, next: NextFunction) {
  const userId = getUserId(req);

  if (!userId) {
    return res.status(401).json({
      error: 'Unauthorized',
    });
  }

  const limit = getUsageLimit(req);

  const key = `usage:${userId}`;

  try {
    const count = await redis.incr(key);

    // first request → set expiry (rolling window)
    if (count === 1) {
      await redis.expire(key, 60 * 60 * 24 * 7); // 7 days rolling
    }

    console.log({
      userId,
      count,
      limit,
    });

    if (count > limit) {
      return res.status(402).json({
        error: 'USAGE_LIMIT_REACHED',
        message: `LLM call limit of ${limit} reached`,
        limit,
        count,
        remaining: 0,
      });
    }

    // optional: attach usage info for downstream
    res.locals.usage = {
      count,
      limit,
      remaining: limit - count,
    };

    return next();
  } catch (err) {
    console.error('[usageLimiter]', err);

    return res.status(503).json({
      error: 'Usage service unavailable',
    });
  }
}
