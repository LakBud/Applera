import crypto from 'crypto';

export function hash(input: unknown): string {
  const str = typeof input === 'string' ? input : JSON.stringify(input);
  return crypto.createHash('sha256').update(str).digest('hex');
}

export function hashRequest(input: unknown): string {
  return hash(JSON.stringify(input));
}
