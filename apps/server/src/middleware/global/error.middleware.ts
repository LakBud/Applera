import mongoose from 'mongoose';
import { ZodError } from 'zod';

import { IS_PROD } from '../../config/env.js';
import { AppError } from '../../utils/errors/app.error.js';

import type { NextFunction, Request, Response } from 'express';

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

    return res.status(err.statusCode).json({
      error: err.message,
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
