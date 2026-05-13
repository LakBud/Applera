import { Request, Response, NextFunction } from "express";
import { GUEST_SECRET } from "../../config/env.js";
import { createHmac, randomUUID } from "crypto";

const COOKIE_NAME = "gid";

// sign guest id to prevent tampering
function sign(value: string) {
  return createHmac("sha256", GUEST_SECRET).update(value).digest("hex");
}

function verify(value: string, signature: string) {
  return sign(value) === signature;
}

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

  if (isValidGuest) {
    guestId = cookie.id;
  } else {
    // regenerate guest identity
    guestId = randomUUID();

    res.cookie(
      COOKIE_NAME,
      {
        id: guestId,
        sig: sign(guestId),
      },
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 1000 * 60 * 60 * 24 * 7,
      },
    );
  }

  req.identity = {
    type: "guest",
    id: guestId,
  };

  next();
}
