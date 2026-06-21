import { redis } from '../../config/redis.js';
import { hashRequest } from '../../utils/shared/hash.utils.js';

import type { NextFunction, Request, Response } from 'express';

const TTL_SECONDS = 60;

const IDEMPOTENT_ROUTES = new Set(['/api/application/create', '/api/interview/generate']);

function normalizePath(path: string) {
  return path.split('?')[0];
}

export async function idempotency(req: Request, res: Response, next: NextFunction) {
  try {
    if (!['POST', 'PATCH'].includes(req.method)) {
      return next();
    }

    const path = normalizePath(req.originalUrl);

    if (!path || !IDEMPOTENT_ROUTES.has(path)) {
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
    });

    const redisKey = `idempotency:${requestHash}`;

    const cached = await redis.get(redisKey);

    if (cached) {
      if (typeof cached === 'string') {
        return res.status(200).json(JSON.parse(cached));
      }
      return res.status(200).json(cached);
    }

    const originalJson = res.json.bind(res);

    res.json = ((body: unknown) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        redis.set(redisKey, JSON.stringify(body), { ex: TTL_SECONDS }).catch(() => {});
      }

      return originalJson(body);
    }) as typeof res.json;

    return next();
  } catch (err) {
    return next(err);
  }
}
