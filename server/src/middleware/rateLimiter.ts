import rateLimit, { RateLimitRequestHandler } from "express-rate-limit";
import { auditLog } from "./log/audit.logger.js";
import { redis } from "../integrations/redis.js";
// Tiered rate limits — stricter on expensive AI routes, looser on cheap ones.
// Each failed LLM call still costs tokens, so we limit at the HTTP layer first.

type LimiterConfig = {
  windowMinutes: number;
  max: number;
  message: string;
  keyPrefix: string;
};

export function limiter(config: LimiterConfig) {
  const windowSeconds = config.windowMinutes * 60;

  return async (req: any, res: any, next: any) => {
    try {
      const identity = req.identity;

      const key = identity?.id ? `rl:${config.keyPrefix}:user:${identity.id}` : `rl:${config.keyPrefix}:ip:${req.ip}`;

      const current = await redis.incr(key);

      if (current === 1) {
        await redis.expire(key, windowSeconds);
      }

      if (current > config.max) {
        void auditLog({
          event: "RATE_LIMIT_HIT",
          userId: identity?.id ?? "unknown",
          userType: identity?.type ?? "guest",
          requestId: req.requestId,
          ip: req.ip,
          userAgent: req.headers["user-agent"],
          metadata: {
            path: req.path,
            method: req.method,
            count: current,
          },
        }).catch(() => {});

        return res.status(429).json({
          error: config.message,
        });
      }

      return next();
    } catch (err) {
      // Fail open (do NOT block traffic if Redis is down)
      console.error("[rateLimiter] Redis error:", err);
      return next();
    }
  };
}

// Route-specific headers

// /api/application/create — triggers 3 LLM calls + DB writes, most expensive
export const applicationLimiter = limiter({
  windowMinutes: 15,
  max: 10,
  message: "Too many application requests. Please wait 15 minutes before trying again.",
  keyPrefix: "application",
});

// /api/cv/upload and /api/job/analyze — 1 LLM call each
export const parseLimiter = limiter({
  windowMinutes: 10,
  max: 20,
  message: "Too many requests. Please wait before trying again.",
  keyPrefix: "parse",
});

// Global fallback applied to all routes
export const globalLimiter = limiter({
  windowMinutes: 15,
  max: 100,
  message: "Too many requests from this IP. Please try again later.",
  keyPrefix: "global",
});
