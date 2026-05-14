import { Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";

import { auditLog } from "../log/audit.logger.js";
import { verify, sign, COOKIE_NAME } from "../../utils/cookieSig.js";
import { Identity } from "../../types/identity.js";

// ─────────────────────────────────────────────
// Identity factory (fully typed)
// ─────────────────────────────────────────────

function createIdentity(type: "user" | "guest", id: string): Identity {
  return {
    type,
    id,
    plan: type === "user" ? "free" : "guest",
  };
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function getAuthenticatedUserId(req: Request): string | null {
  const id = req.auth?.userId;
  return typeof id === "string" && id.length > 0 ? id : null;
}

function getValidGuestId(req: Request): string | null {
  const cookie = req.cookies?.[COOKIE_NAME];

  if (!cookie || typeof cookie !== "object") return null;

  const { id, sig } = cookie as { id?: unknown; sig?: unknown };

  if (typeof id !== "string" || typeof sig !== "string") return null;

  if (!verify(id, sig)) return null;

  return id;
}

// ─────────────────────────────────────────────
// Middleware
// ─────────────────────────────────────────────

export function attachIdentity(req: Request, res: Response, next: NextFunction) {
  const userId = getAuthenticatedUserId(req);

  // ─────────────────────────────
  // AUTH USER
  // ─────────────────────────────
  if (userId) {
    req.identity = createIdentity("user", userId);
    return next();
  }

  // ─────────────────────────────
  // GUEST USER
  // ─────────────────────────────
  const existingGuestId = getValidGuestId(req);

  const guestId = existingGuestId ?? randomUUID();
  const isNewGuest = !existingGuestId;

  if (isNewGuest) {
    res.cookie(
      COOKIE_NAME,
      { id: guestId, sig: sign(guestId) },
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 1000 * 60 * 60 * 24 * 30,
      },
    );

    void auditLog({
      event: "GUEST_SESSION_CREATED",
      userId: guestId,
      userType: "guest",
      requestId: req.requestId,
      ip: req.ip,
    }).catch((err) => {
      console.warn("[auditLog failed]", {
        err,
        requestId: req.requestId,
      });
    });
  }

  req.identity = createIdentity("guest", guestId);

  next();
}
