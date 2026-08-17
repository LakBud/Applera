import mongoose from 'mongoose';
import { isLLMError, type LLMErrorType } from 'vern-llm';
import { ZodError } from 'zod';

import { IS_PROD } from '../../config/env.js';
import { AppError } from '../../utils/errors/app.error.js';

import type { NextFunction, Request, Response } from 'express';

const LLM_ERROR_STATUS: Record<LLMErrorType, number> = {
  timeout: 504,
  api: 502,
  network: 502,
  parse: 502,
  validation: 502,
  invalid_params: 500,
  rate_limited: 429,
  quota_exceeded: 429,
  circuit_open: 503,
  fallback_exhausted: 502,
  aborted: 499,
  unknown: 502,
};

export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
  if (res.headersSent) {
    return next(err);
  }

  const requestId = res.locals.requestId;

  // Application errors

  if (err instanceof AppError) {
    console.error('[app error]', {
      requestId,
      method: req.method,
      path: req.originalUrl,
      name: err.name,
      code: err.code,
      statusCode: err.statusCode,
      message: err.message,
    });

    const message =
      IS_PROD && err.statusCode >= 500 ? 'An unexpected error occurred.' : err.message;

    return res.status(err.statusCode).json({
      error: message,
      code: err.code,
      requestId,
    });
  }

  // Zod validation errors

  if (err instanceof ZodError) {
    console.error('[validation error]', {
      requestId,
      issues: err.issues,
    });

    return res.status(400).json({
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      issues: err.issues,
      requestId,
    });
  }

  // Mongoose validation errors

  if (err instanceof mongoose.Error.ValidationError) {
    console.error('[mongoose validation error]', {
      requestId,
      message: err.message,
    });

    return res.status(400).json({
      error: 'Database validation failed',
      code: 'DATABASE_VALIDATION_ERROR',
      requestId,
    });
  }

  // Mongo duplicate key

  if (typeof err === 'object' && err !== null && 'code' in err && err.code === 11000) {
    console.error('[duplicate key error]', {
      requestId,
    });

    return res.status(409).json({
      error: 'Resource already exists',
      code: 'DUPLICATE_RESOURCE',
      requestId,
    });
  }

  // LLM errors (vern-llm)

  if (isLLMError(err)) {
    if (err.type === 'aborted') {
      console.warn('[llm aborted]', { requestId });
      return;
    }

    console.error('[llm error]', {
      requestId,
      method: req.method,
      path: req.originalUrl,
      type: err.type,
      code: err.code,
      status: err.status,
      retryable: err.retryable,
      attempts: err.attempts?.length,
    });

    const statusCode = LLM_ERROR_STATUS[err.type] ?? 502;

    return res.status(statusCode).json({
      error: IS_PROD ? 'The AI service is unavailable. Please try again shortly.' : err.message,
      code: err.code ?? err.type.toUpperCase(),
      requestId,
    });
  }

  // Abort / timeout

  if (err instanceof Error && (err.name === 'AbortError' || err.name === 'TimeoutError')) {
    console.warn('[request aborted]', {
      requestId,
      message: err.message,
    });

    return;
  }

  // Unknown errors

  console.error('[unknown server error]', {
    requestId,
    method: req.method,
    path: req.originalUrl,
    error:
      err instanceof Error
        ? {
            name: err.name,
            message: err.message,
            stack: IS_PROD ? undefined : err.stack,
          }
        : String(err),
  });

  return res.status(500).json({
    error: IS_PROD
      ? 'An unexpected error occurred.'
      : err instanceof Error
        ? err.message
        : 'Unknown server error',
    code: 'INTERNAL_SERVER_ERROR',
    requestId,
  });
}
