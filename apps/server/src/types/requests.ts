import type { Identity } from './schemas/identity.schemas.js';
import type { NextFunction, Request, RequestHandler, Response } from 'express';

export interface IdentifiedRequest extends Request {
  identity: Identity;
}

export interface UserRequest extends Request {
  identity: Extract<Identity, { type: 'user' }>;
}

export function withIdentity(
  handler: (req: IdentifiedRequest, res: Response, next: NextFunction) => unknown,
): RequestHandler {
  return (req, res, next) => handler(req as IdentifiedRequest, res, next);
}

export function withUser(
  handler: (req: UserRequest, res: Response, next: NextFunction) => unknown,
): RequestHandler {
  return (req, res, next) => handler(req as UserRequest, res, next);
}
