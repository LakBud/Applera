import type { Request } from 'express';

export function getUserId(req: Request): string | null {
  if (req.identity?.type === 'user') {
    return `user:${req.identity.id}`;
  }

  return null;
}
