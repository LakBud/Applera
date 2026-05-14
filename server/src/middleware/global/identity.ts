import { Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";
import { auditLog } from "../log/audit.logger.js";
import { verify, sign } from "../../utils/cookieSig.js";

const COOKIE_NAME = "guest_identity";

export function attachIdentity(req: Request, res: Response, next: NextFunction) {
  const clerkUserId = req.auth?.userId;

  // ── Authenticated user (Clerk) ─────────────────────────────
  if (clerkUserId) {
    req.identity = {
      type: "user",
      id: clerkUserId,
    };
    return next();
  }

  // ── Guest user (cookie-based) ──────────────────────────────
  const cookie = req.cookies?.[COOKIE_NAME];
  const isValidGuest = cookie?.id && cookie?.sig && verify(cookie.id, cookie.sig);

  let guestId: string;
  let isNewGuest: boolean = false;

  if (isValidGuest) {
    guestId = cookie.id;
  } else {
    // New guest — regenerate identity and flag for audit
    guestId = randomUUID();
    isNewGuest = true;

    res.cookie(
      COOKIE_NAME,
      { id: guestId, sig: sign(guestId) },
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      },
    );
  }

  req.identity = {
    type: "guest",
    id: guestId,
  };

  // Log new guest sessions — useful for detecting bot traffic or
  // users cycling cookies to bypass guest-level rate limits
  if (isNewGuest) {
    auditLog({
      event: "LOGIN_SUCCESS",
      userId: guestId,
      userType: "guest",
      requestId: req.requestId,
      ip: req.ip,
      userAgent: req.headers["user-agent"] as string,
      metadata: { reason: "new_guest_session" },
    }).catch(() => {}); // fire and forget — never block the request
  }

  next();
}
