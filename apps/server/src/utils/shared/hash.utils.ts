import crypto from 'crypto';

export function hash(input: unknown): string {
  try {
    const str = typeof input === 'string' ? input : (JSON.stringify(input) ?? 'undefined');

    return crypto.createHash('sha256').update(str).digest('hex');
  } catch {
    return crypto.createHash('sha256').update('undefined').digest('hex');
  }
}

export function hashBuffer(buffer: Buffer): string {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

export function hashRequest(input: unknown): string {
  return hash(JSON.stringify(input));
}
