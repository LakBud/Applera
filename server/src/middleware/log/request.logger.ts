import { Request, Response, NextFunction } from "express";
import crypto from "crypto";

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const requestId = crypto.randomUUID();
  req.requestId = requestId;

  const start = Date.now();

  res.on("finish", () => {
    console.info(
      "[request]",
      JSON.stringify({
        requestId,
        timestamp: new Date().toISOString(),
        method: req.method,
        path: req.originalUrl,
        status: res.statusCode,
        duration_ms: Date.now() - start,
        ip: req.ip,
        userAgent: req.headers["user-agent"],
      }),
    );
  });

  next();
}
