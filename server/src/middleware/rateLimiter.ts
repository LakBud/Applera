import rateLimit, { RateLimitRequestHandler } from "express-rate-limit";
import { auditLog } from "./log/audit.logger.js";
// Tiered rate limits — stricter on expensive AI routes, looser on cheap ones.
// Each failed LLM call still costs tokens, so we limit at the HTTP layer first.

export function limiter(windowMinutes: number, max: number, message: string) {
  return rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,

    message: { error: message },

    handler: async (req, res, _next, options) => {
      await auditLog({
        event: "RATE_LIMIT_HIT",
        userId: req.identity?.id ?? "unknown",
        userType: req.identity?.type ?? "guest",
        requestId: req.requestId, // ← add this
        ip: req.ip,
        userAgent: req.headers["user-agent"],
        metadata: {
          path: req.path,
          method: req.method,
        },
      });

      res.status(options.statusCode).json(options.message);
    },
  });
}

// Route-specific headers

// /api/application/create — triggers 3 LLM calls + DB writes, most expensive
export const applicationLimiter = limiter(
  15, // per 15 minutes
  10, // max 10 requests
  "Too many application requests. Please wait 15 minutes before trying again.",
);

// /api/cv/upload and /api/job/analyze — 1 LLM call each
export const parseLimiter = limiter(
  10, // per 10 minutes
  20, // max 20 requests
  "Too many requests. Please wait before trying again.",
);

// Global fallback applied to all routes
export const globalLimiter = limiter(15, 100, "Too many requests from this IP. Please try again later.");
