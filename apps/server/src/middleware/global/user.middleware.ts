import { UnauthorizedError } from '../../utils/errors/unauthorized.error.js';

import type { UserRequest } from '../../types/requests.js';
import type { NextFunction, Request, RequestHandler, Response } from 'express';

export function requireUser(req: Request, res: Response, next: NextFunction) {
  if (!req.identity || req.identity.type !== 'user') {
    return next(new UnauthorizedError());
  }
  return next();
}

export function withUser(
  handler: (req: UserRequest, res: Response, next: NextFunction) => unknown,
): RequestHandler {
  return (req, res, next) => {
    if (!req.identity || req.identity.type !== 'user') {
      return next(new UnauthorizedError());
    }
    return handler(req as UserRequest, res, next);
  };
}
