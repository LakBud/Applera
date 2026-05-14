import { Request, Response, NextFunction } from "express";
import { hashRequest } from "../utils/hashRequest.js";
import { redis } from "../lib/redis.js";

const TTL_SECONDS = 60;

const IDEMPOTENT_ROUTES = new Set(["/api/application/create", "/api/interview/generate"]);

export async function idempotency(req: Request, res: Response, next: NextFunction) {
  try {
    if (!["POST", "PATCH"].includes(req.method)) {
      return next();
    }

    if (!IDEMPOTENT_ROUTES.has(req.originalUrl)) {
      return next();
    }

    const identity = req.identity;

    if (!identity) {
      return next();
    }

    const requestHash = hashRequest({
      ownerId: identity.id,
      ownerType: identity.type,
      path: req.originalUrl,
      body: req.body,
    });

    const redisKey = `idempotency:${requestHash}`;

    const cached = (await redis.get(redisKey)) as string | null;

    if (cached) {
      return res.status(200).json(JSON.parse(cached));
    }

    const originalJson = res.json.bind(res);

    res.json = ((body: unknown) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        void redis.set(redisKey, JSON.stringify(body), {
          ex: TTL_SECONDS,
        });
      }

      return originalJson(body);
    }) as typeof res.json;

    return next();
  } catch (err) {
    return next(err);
  }
}
