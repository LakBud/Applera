import type { NextFunction, Request, Response } from 'express';

// Enforces a response deadline for requests.
//
// Without this, a stalled operation (OpenAI call, database query, external API,
// etc.) can leave the HTTP connection open until the underlying operation
// eventually resolves or fails.
//
// Timeouts configured on individual dependencies (axios/fetch, database clients,
// etc.) handle specific operations, but this middleware provides a final
// request-level deadline for anything that exceeds the allowed response time.
//
// Once the deadline fires and a 503 response is sent, later response write
// attempts from downstream code (controller logic still resolving,
// validateResponse, etc.) are suppressed to prevent duplicate responses and
// potential ERR_HTTP_HEADERS_SENT errors.

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

  const suppressWrite = (...args: unknown[]): Response => {
    const callback = args.find((arg): arg is () => void => typeof arg === 'function');

    callback?.();

    return res;
  };

  res.json = suppressWrite as typeof res.json;
  res.send = suppressWrite as typeof res.send;
  res.end = suppressWrite as typeof res.end;
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
