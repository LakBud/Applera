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
// On deadline (or client disconnect), the request's AbortSignal is aborted so
// downstream async work can cancel itself, and — if a deadline 503 was sent —
// later response write attempts from downstream code (controller logic still
// resolving, validateResponse, etc.) are suppressed to prevent duplicate
// responses and potential ERR_HTTP_HEADERS_SENT errors.

/**
 * Returns true if this response has already been timed out by aiTimeout.
 * Response-writing middleware (e.g. validateResponse) can check this before
 * doing any work, to skip unnecessary validation on a response that will
 * never actually go out.
 */
export function isResponseTimedOut(res: Response): boolean {
  return Boolean(res.locals.aiTimedOut);
}

/**
 * Returns the AbortSignal for this request, wired up by aiTimeout. Pass this
 * into fetch/axios/OpenAI SDK calls, DB queries, etc. so they get cancelled
 * when the deadline fires or the client disconnects.
 *
 * Throws if aiTimeout middleware hasn't run for this request, so callers
 * fail loudly instead of silently running with no cancellation.
 */
export function getAbortSignal(res: Response): AbortSignal {
  const controller = res.locals.aiAbortController as AbortController | undefined;

  if (!controller) {
    throw new Error('getAbortSignal called without aiTimeout middleware installed');
  }

  return controller.signal;
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

    const controller = new AbortController();
    res.locals.aiAbortController = controller;

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

      // Cancel any downstream work still in flight (OpenAI call, DB query, etc).
      controller.abort(new Error('Request timed out'));
    }, ms);

    res.on('finish', () => {
      finished = true;
      clearTimeout(timer);
    });

    res.on('close', () => {
      finished = true;
      clearTimeout(timer);

      // Client disconnected before we finished — no point continuing
      // downstream work either, even though this wasn't a deadline timeout.
      if (!controller.signal.aborted) {
        controller.abort(new Error('Client disconnected'));
      }
    });

    next();
  };
}
