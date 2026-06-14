import { NextFunction, Request, Response } from 'express';

import { redis } from '../integrations/redis.js';
import { auditLog } from './log/audit.logger.js';

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

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const identity = req.identity;

      if (!identity) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const key = `rl:${config.keyPrefix}:user:${identity.id}`;

      const current = await redis.incr(key);

      if (current === 1) {
        await redis.expire(key, windowSeconds);
      }

      if (current > config.max) {
        void auditLog({
          event: 'RATE_LIMIT_HIT',
          userId: identity.id,
          userType: identity.type,
          requestId: req.requestId,
          ip: req.ip,
          userAgent: req.headers['user-agent'],
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
      console.error('[rateLimiter] Redis error:', err);
      return next();
    }
  };
}

// For unauthenticated routes (webhooks) — key by IP instead of user identity
export function ipLimiter(config: LimiterConfig) {
  const windowSeconds = config.windowMinutes * 60;

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const key = `rl:${config.keyPrefix}:ip:${req.ip}`;

      const current = await redis.incr(key);

      if (current === 1) {
        await redis.expire(key, windowSeconds);
      }

      if (current > config.max) {
        void auditLog({
          event: 'RATE_LIMIT_HIT_IP',
          userId: 'anonymous',
          userType: 'guest',
          requestId: req.requestId,
          ip: req.ip,
          userAgent: req.headers['user-agent'],
          metadata: {
            path: req.path,
            method: req.method,
            count: current,
            keyPrefix: config.keyPrefix,
          },
        }).catch(() => {});

        return res.status(429).json({ error: config.message });
      }

      return next();
    } catch (err) {
      console.error('[ipLimiter] Redis error:', err);
      return next();
    }
  };
}

// Route-specific headers

// /api/application/create — triggers 3 LLM calls + DB writes, most expensive
export const applicationLimiter = limiter({
  windowMinutes: 15,
  max: 10,
  message: 'Too many application requests. Please wait 15 minutes before trying again.',
  keyPrefix: 'application',
});

// /api/cv/upload and /api/job/analyze — 1 LLM call each
export const parseLimiter = limiter({
  windowMinutes: 10,
  max: 20,
  message: 'Too many requests. Please wait before trying again.',
  keyPrefix: 'parse',
});

// Global fallback applied to all routes
export const globalLimiter = limiter({
  windowMinutes: 15,
  max: 250,
  message: 'Too many requests. Please try again later.',
  keyPrefix: 'global',
});

// Ip headers
export const webhookLimiter = ipLimiter({
  windowMinutes: 1,
  max: 60,
  message: 'Too many webhook requests.',
  keyPrefix: 'webhook',
});

export const earlyLimiter = ipLimiter({
  windowMinutes: 1,
  max: 300,
  message: 'Too many requests.',
  keyPrefix: 'early',
});
