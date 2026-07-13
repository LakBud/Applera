import type { NextFunction, Request, Response } from 'express';

// Enforces a hard deadline on requests and closes hung connections.
//
// Without this, a stalled OpenAI call holds the connection open indefinitely.
// Enough of these will exhaust Node's connection pool and take down the server.
//
// The axios/fetch timeout in the LLM client handles the AI call itself,
// but this middleware catches anything else that might stall (DB writes, etc).
//
// Once the deadline fires and the 503 is sent, any later write attempt from
// downstream (controller logic still resolving, validateResponse, etc.) is
// no-op'd rather than allowed through — writing twice would throw
// ERR_HTTP_HEADERS_SENT and could crash the process.

/**
 * Returns true if this response has already been timed out by aiTimeout.
 * Response-writing middleware (e.g. validateResponse) can check this before
 * doing any work, to skip unnecessary validation on a response that will
 * never actually go out.
 */
export function isResponseTimedOut(res: Response): boolean {
  return Boolean(res.locals.aiTimedOut);
}

function noopLateWrites(res: Response): void {
  res.locals.aiTimedOut = true;

  const noop = () => res;

  res.json = noop as typeof res.json;
  res.send = noop as typeof res.send;
  res.end = noop as typeof res.end;
}

/**
 * @param {number} ms  Timeout in milliseconds
 */
export function aiTimeout(ms: number) {
  return (req: Request, res: Response, next: NextFunction): void => {
    let finished = false;

    const timer = setTimeout(() => {
      if (finished) {
        return;
      }

      finished = true;

      if (!res.headersSent) {
        res.status(503).json({
          error: 'Request timed out',
        });
      }

      // Prevent any late write from downstream (controller still resolving,
      // validateResponse, etc.) from touching the response after this point.
      noopLateWrites(res);
    }, ms);

    res.on('finish', () => {
      finished = true;
      clearTimeout(timer);
    });

    res.on('close', () => {
      finished = true;
      clearTimeout(timer);
    });

    next();
  };
}
