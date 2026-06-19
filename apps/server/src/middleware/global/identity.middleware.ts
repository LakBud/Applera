import { randomUUID } from 'crypto';
import type { NextFunction, Request, Response } from 'express';

import { COOKIE_NAME, sign } from '../../lib/cookie.js';
import User from '../../models/User.js';
import { auditLog } from '../../services/audit/audit.service.js';
import { IdentitySchema } from '../../types/schemas/identity.schemas.js';
import { getAuthenticatedUserId, getValidGuestId } from '../../utils/user/getUserId.utils.js';

export async function attachIdentity(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getAuthenticatedUserId(req);

    // AUTH USER

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

    // GUEST USER

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
