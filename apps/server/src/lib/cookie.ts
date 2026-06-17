// HMAC-SHA256 signing for guest identity cookies.
// Prevents clients from forging or tampering with their guest ID.
//
// sign(id)        → produces a hex HMAC signature for the given id
// verify(id, sig) → returns true if the signature matches the id
import { createHmac, timingSafeEqual } from 'crypto';

import { COOKIE_SECRET } from '../config/env.js';

if (!COOKIE_SECRET) {
  throw new Error('Missing required environment variable: COOKIE_SECRET');
}

export function sign(id: string): string {
  return createHmac('sha256', COOKIE_SECRET!).update(id).digest('hex');
}

export function verify(id: string, sig: string): boolean {
  try {
    const expected = sign(id);

    // Constant-time comparison — prevents timing attacks on the signature
    return timingSafeEqual(Buffer.from(sig, 'utf8'), Buffer.from(expected, 'utf8'));
  } catch {
    return false;
  }
}

export const COOKIE_NAME = 'guest_identity';
