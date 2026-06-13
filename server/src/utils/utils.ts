import { timingSafeEqual } from 'crypto';

// API_KEY compare func
export function safeCompare(a: string, b: string): boolean {
  // Must be same length for timingSafeEqual — pad to prevent length leakage
  const aBuf = Buffer.from(a.padEnd(128));
  const bBuf = Buffer.from(b.padEnd(128));
  return timingSafeEqual(aBuf, bBuf);
}
// NoSQL sanitiser func
export function stripObject(obj: unknown): void {
  if (!obj || typeof obj !== 'object') {
    return;
  }
  for (const key of Object.keys(obj as Record<string, unknown>)) {
    const value = (obj as Record<string, unknown>)[key];
    if (key.startsWith('$') || key.includes('.')) {
      delete (obj as Record<string, unknown>)[key];
    } else {
      stripObject(value);
    }
  }
}

// Max reps of repair
export const MAX_LENGTH = 20000;
