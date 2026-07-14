import { redis } from '../config/redis.js';
import { hashBuffer, hashRequest } from '../utils/shared/hash.utils.js';

import type { NextFunction, Request, Response } from 'express';

const TTL_SECONDS = 90;

const IDEMPOTENT_ROUTE_PREFIXES = ['/api/application', '/api/interview', '/api/cv', '/api/job'];

function normalizePath(path: string) {
  return path.split('?')[0];
}

function isIdempotentRoute(path: string) {
  return IDEMPOTENT_ROUTE_PREFIXES.some((route) => path === route || path.startsWith(`${route}/`));
}

export async function idempotency(req: Request, res: Response, next: NextFunction) {
  try {
    if (!['POST', 'PATCH'].includes(req.method)) {
      return next();
    }

    const path = normalizePath(req.originalUrl);

    if (!path || !isIdempotentRoute(path)) {
      return next();
    }

    if (!req.identity) {
      return next();
    }

    const requestHash = hashRequest({
      ownerId: req.identity.id,
      ownerType: req.identity.type,
      path,
      body: req.body,
      fileHash: req.file?.buffer ? hashBuffer(req.file.buffer) : null,
    });

    const redisKey = `idempotency:${requestHash}`;

    const cached = await redis.get(redisKey);

    if (cached) {
      if (cached === 'IN_PROGRESS') {
        return res.status(409).json({
          error: 'Request already in progress, please retry shortly',
        });
      }

      if (typeof cached === 'string') {
        const parsed = JSON.parse(cached);

        return res.status(parsed.status).json(parsed.body);
      }
    }

    // Claim key atomically. Only one request proceeds.
    const claimed = await redis.set(redisKey, 'IN_PROGRESS', {
      ex: TTL_SECONDS,
      nx: true,
    });

    if (!claimed) {
      return res.status(409).json({
        error: 'Request already in progress, please retry shortly',
      });
    }

    let settled = false;

    const originalJson = res.json.bind(res);

    res.json = ((body: unknown) => {
      settled = true;

      if (res.statusCode >= 200 && res.statusCode < 300) {
        redis
          .set(
            redisKey,
            JSON.stringify({
              status: res.statusCode,
              body,
            }),
            {
              ex: TTL_SECONDS,
            },
          )
          .catch(() => {});
      } else {
        // Allow retries after failed requests.
        redis.del(redisKey).catch(() => {});
      }

      return originalJson(body);
    }) as typeof res.json;

    res.on('close', () => {
      if (settled) {
        return;
      }

      // Dont leave the caller stuck behind an IN_PROGRESS
      // lock until TTL expiry; let them retry immediately.
      redis.del(redisKey).catch(() => {});
    });

    return next();
  } catch (err) {
    return next(err);
  }
}
