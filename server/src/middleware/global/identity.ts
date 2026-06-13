import { getAuth } from '@clerk/express';
import { randomUUID } from 'crypto';
import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

import User from '../../models/User.js';
import { COOKIE_NAME, sign, verify } from '../../utils/cookieSig.js';
import { auditLog } from '../log/audit.logger.js';

// ─────────────────────────────────────────────
// Identity Schema (single source of truth)
// ─────────────────────────────────────────────

export const IdentitySchema = z.object({
  type: z.enum(['user', 'guest']),
  id: z.string(),
  plan: z.enum(['guest', 'free', 'pro', 'enterprise', 'admin']),
});

export type Identity = z.infer<typeof IdentitySchema>;

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function getAuthenticatedUserId(req: Request): string | null {
  const { userId } = getAuth(req);
  return userId ?? null;
}

function getValidGuestId(req: Request): string | null {
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

// ─────────────────────────────────────────────
// Middleware
// ─────────────────────────────────────────────

export async function attachIdentity(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getAuthenticatedUserId(req);

    // ─────────────────────────────
    // AUTH USER
    // ─────────────────────────────
    if (userId) {
      const user = await User.findOne({ clerkId: userId }).select('plan');

      const identity = IdentitySchema.parse({
        type: 'user',
        id: userId,
        plan: user?.plan ?? 'free',
      });

      req.identity = identity;
      return next();
    }

    // ─────────────────────────────
    // GUEST USER
    // ─────────────────────────────
    const existingGuestId = getValidGuestId(req);

    const guestId = existingGuestId ?? randomUUID();

    if (!existingGuestId) {
      res.cookie(
        COOKIE_NAME,
        { id: guestId, sig: sign(guestId) },
        {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 1000 * 60 * 60 * 24 * 30,
        },
      );

      void auditLog({
        event: 'GUEST_SESSION_CREATED',
        userId: guestId,
        userType: 'guest',
        requestId: req.requestId,
        ip: req.ip,
      }).catch((err) => {
        console.warn('[auditLog failed]', { err, requestId: req.requestId });
      });
    }

    const identity = IdentitySchema.parse({
      type: 'guest',
      id: guestId,
      plan: 'guest',
    });

    req.identity = identity;

    return next();
  } catch (err) {
    console.error('[attachIdentity] failed', err);
    return res.status(500).json({ error: 'Identity resolution failed' });
  }
}

export function requireUser(req: Request, res: Response, next: NextFunction) {
  if (!req.identity || req.identity.type !== 'user') {
    return res.status(401).json({
      error: 'You need to sign in to access this feature',
    });
  }
  return next();
}
