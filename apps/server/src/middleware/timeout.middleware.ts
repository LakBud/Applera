import type { NextFunction, Request, Response } from 'express';

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

function abortError(message: string): Error {
  const err = new Error(message);
  err.name = 'AbortError';
  return err;
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
      controller.abort(abortError('Request timed out'));
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
        noopLateWrites(res);
        controller.abort(abortError('Client disconnected'));
      }
    });

    next();
  };
}
