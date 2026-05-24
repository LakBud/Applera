import type { Request } from "express";
// ─────────────────────────────────────────────
// Usage limits
// ─────────────────────────────────────────────

export function getUsageLimit(req: Request): number {
  const identity = req.identity;

  // Guest users
  if (!identity || identity.type !== "user") {
    return 3;
  }

  // Logged-in free tier
  if (!identity.plan || identity.plan === "free") {
    return 200;
  }

  // Paid tiers
  if (identity.plan === "pro") return 100;
  if (identity.plan === "enterprise") return 1000;

  return 20;
}
