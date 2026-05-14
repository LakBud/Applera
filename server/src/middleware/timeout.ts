import { Request, Response, NextFunction } from "express";
// Enforces a hard deadline on requests and closes hung connections.
//
// Without this, a stalled OpenAI call holds the connection open indefinitely.
// Enough of these will exhaust Node's connection pool and take down the server.
//
// The axios/fetch timeout in the LLM client handles the AI call itself,
// but this middleware catches anything else that might stall (DB writes, etc).

/**
 * @param {number} ms  Timeout in milliseconds
 */

export function aiTimeout(ms: number) {
  return (req: Request, res: Response, next: NextFunction): void => {
    let finished = false;

    const timer = setTimeout(() => {
      if (finished) return;

      finished = true;

      if (!res.headersSent) {
        res.status(503).json({
          error: "Request timed out",
        });
      }
    }, ms);

    res.on("finish", () => {
      finished = true;
      clearTimeout(timer);
    });

    res.on("close", () => {
      finished = true;
      clearTimeout(timer);
    });

    next();
  };
}
