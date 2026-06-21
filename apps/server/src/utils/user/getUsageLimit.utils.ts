import type { Request } from 'express';

// ─────────────────────────────────────────────
// Usage limits
// ─────────────────────────────────────────────

export function getUsageLimit(req: Request): number {
  const identity = req.identity;

  // Guest users
  if (!identity || identity.type !== 'user') {
    return 0;
  }

  // Logged-in free tier
  if (!identity.plan || identity.plan === 'free') {
    return 6000;
  }

  // Paid tiers
  if (identity.plan === 'pro') {
    return 100;
  }
  if (identity.plan === 'enterprise') {
    return 1000;
  }

  if (identity.plan === 'admin') {
    return Number.MAX_SAFE_INTEGER;
  }

  return 0;
}
