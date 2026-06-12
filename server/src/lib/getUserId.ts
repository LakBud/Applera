import type { Request } from 'express';

export function getUserId(req: Request): string {
  // 1. Logged-in user
  if (req.identity?.type === 'user') {
    return `user:${req.identity.id}`;
  }

  console.log('[USER ID DEBUG]', {
    auth: req.auth,
    identity: req.identity,
    headers: {
      authorization: req.headers.authorization,
      cookie: !!req.cookies,
    },
  });

  // 2. Safe header handling
  const header = req.headers['x-anonymous-id'];

  const anonId = Array.isArray(header) ? header[0] : header?.toString() || req.identity?.id;

  return `guest:${anonId}`;
}
