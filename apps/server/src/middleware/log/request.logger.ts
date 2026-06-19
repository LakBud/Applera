import crypto from 'crypto';
import type { NextFunction, Request, Response } from 'express';

import { maskIp } from '../../utils/shared/sanitize.utils.js';

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const requestId = crypto.randomUUID();
  req.requestId = requestId;

  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;

    const log = {
      requestId,
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.originalUrl.split('?')[0],
      status,
      duration_ms: duration,
      ip: req.ip ? maskIp(req.ip) : '',
      userAgent: req.headers['user-agent'],
    };

    if (status >= 500) {
      console.error('[request:error]', JSON.stringify(log));
    } else if (status >= 400) {
      console.warn('[request:warn]', JSON.stringify(log));
    } else if (duration > 3000) {
      console.warn('[request:slow]', JSON.stringify(log));
    } else {
      console.info('[request]', JSON.stringify(log));
    }
  });

  next();
}
