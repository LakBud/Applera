const USAGE_PREFIX = 'usage';

export function usageKey(userId: string): string {
  return `${USAGE_PREFIX}:${userId}`;
}
