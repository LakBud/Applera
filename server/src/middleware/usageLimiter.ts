import { Request, Response, NextFunction } from "express";
import { redis } from "../integrations/redis.js";
import { getUserId } from "../lib/getUserId.js";
import { getUsageLimit } from "../lib/getUsageLimit.js";

export async function usageLimiter(req: Request, res: Response, next: NextFunction) {
  const userId = getUserId(req);
  const limit = getUsageLimit(req);

  const key = `usage:${userId}`;

  console.log("USER ID:", userId);
  console.log("LIMIT:", limit);
  console.log("KEY:", key);

  try {
    const count = await redis.incr(key);

    // first request → set expiry (rolling window)
    if (count === 1) {
      await redis.expire(key, 60 * 60 * 24 * 7); // 7 days rolling
    }

    if (count > limit) {
      return res.status(403).json({
        error: "Free limit reached",
        limit,
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
    console.error("[usageLimiter]", err);

    return res.status(503).json({
      error: "Usage service unavailable",
    });
  }
}
