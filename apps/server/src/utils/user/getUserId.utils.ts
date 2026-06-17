import { getAuth } from '@clerk/express';
import type { Request } from 'express';

import { COOKIE_NAME, verify } from '../../lib/cookie.js';

export function getUserId(req: Request): string | null {
  if (req.identity?.type === 'user') {
    return `user:${req.identity.id}`;
  }

  return null;
}

export function getAuthenticatedUserId(req: Request): string | null {
  const { userId } = getAuth(req);
  return userId ?? null;
}

export function getValidGuestId(req: Request): string | null {
  const cookie = req.cookies?.[COOKIE_NAME];

  if (!cookie || typeof cookie !== 'object') {
    return null;
  }

  const { id, sig } = cookie as { id?: unknown; sig?: unknown };

  if (typeof id !== 'string' || typeof sig !== 'string') {
    return null;
  }

  if (!verify(id, sig)) {
    return null;
  }

  return id;
}
