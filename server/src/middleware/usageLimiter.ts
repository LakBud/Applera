import { Request, Response, NextFunction } from "express";
import { redis } from "../lib/redis.js";

const LIMIT = 3;

export async function guestUsageLimiter(req: Request, res: Response, next: NextFunction) {
  const identity = req.identity;

  // logged-in users bypass
  if (!identity || identity.type === "user") {
    return next();
  }

  const key = `guest:usage:${identity.id}`;

  try {
    const count = await redis.incr(key);

    if (count === 1) {
      await redis.expire(key, 60 * 60 * 24 * 7); // 7 days
    }

    if (count > LIMIT) {
      return res.status(403).json({
        error: "Free limit reached. Please sign in to continue.",
      });
    }

    next();
  } catch (err) {
    console.error("[guestUsageLimiter]", err);

    return res.status(503).json({
      error: "Usage service unavailable. Try again later.",
    });
  }
}
