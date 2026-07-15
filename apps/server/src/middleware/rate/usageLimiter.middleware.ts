import { redis } from '../../config/redis.js';
import { usageKey } from '../../utils/shared/usageKey.utils.js';
import { getUsageLimit } from '../../utils/user/getUsageLimit.utils.js';
import { getUserId } from '../../utils/user/getUserId.utils.js';

import type { NextFunction, Request, Response } from 'express';

const ROLLING_WINDOW_SECONDS = 60 * 60 * 24 * 7; // 7 days

export async function usageLimiter(req: Request, res: Response, next: NextFunction) {
  const userId = getUserId(req);

  if (!userId) {
    return res.status(401).json({
      error: 'Unauthorized',
    });
  }

  const limit = getUsageLimit(req);
  const key = usageKey(userId);

  try {
    const current = Number((await redis.get(key)) ?? 0);

    if (current >= limit) {
      return res.status(402).json({
        error: 'USAGE_LIMIT_REACHED',
        message: `LLM call limit of ${limit} reached`,
        limit,
        count: current,
        remaining: 0,
      });
    }

    let charged = false;

    req.reserveUsage = async () => {
      if (charged) {
        return {
          count: current,
          limit,
          remaining: Math.max(limit - current, 0),
        };
      }
      charged = true;

      const count = await redis.incr(key);

      if (count === 1) {
        await redis.expire(key, ROLLING_WINDOW_SECONDS);
      }

      console.log({ userId, count, limit });

      return {
        count,
        limit,
        remaining: Math.max(limit - count, 0),
      };
    };

    res.locals.usage = {
      count: current,
      limit,
      remaining: Math.max(limit - current, 0),
    };

    return next();
  } catch (err) {
    console.error('[usageLimiter]', err);

    return res.status(503).json({
      error: 'Usage service unavailable',
    });
  }
}
