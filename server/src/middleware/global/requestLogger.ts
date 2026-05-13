import { Request, Response, NextFunction } from "express";

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const requestId = crypto.randomUUID();
  req.headers["x-request-id"] = requestId; // propagate downstream

  res.on("finish", () => {
    const event = {
      requestId,
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.path,
      status: res.statusCode,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    };

    // Security events get their own log level
    if (res.statusCode === 401 || res.statusCode === 429) {
      console.warn("[security]", JSON.stringify(event));
    } else {
      console.info("[request]", JSON.stringify(event));
    }
  });

  next();
}
