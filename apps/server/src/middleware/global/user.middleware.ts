import type { UserRequest } from '../../types/requests.js';
import type { NextFunction, Request, RequestHandler, Response } from 'express';

export function requireUser(req: Request, res: Response, next: NextFunction) {
  if (!req.identity || req.identity.type !== 'user') {
    return res.status(401).json({
      error: 'You need to sign in to access this feature',
    });
  }
  return next();
}

export function withUser(
  handler: (req: UserRequest, res: Response, next: NextFunction) => unknown,
): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(handler(req as UserRequest, res, next)).catch(next);
  };
}
