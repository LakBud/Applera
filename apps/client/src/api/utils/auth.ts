import { rawClient } from '@/api/rawClient';
import type { Clerk } from '@clerk/react/types';

declare global {
  interface Window {
    Clerk?: Clerk;
  }
}

export async function safeGetToken(): Promise<string | null> {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const clerk = window.Clerk;
    if (!clerk?.session) {
      return null;
    }
    const token = await clerk.session.getToken();
    return token ?? null;
  } catch {
    return null;
  }
}

export async function getCsrfToken(csrfToken: string | null): Promise<string> {
  if (csrfToken) {
    return csrfToken;
  }

  const res = await rawClient.get('/api/csrf-token');
  const rawToken = res?.data?.csrfToken;
  const token = typeof rawToken === 'string' ? rawToken.trim() : '';
  csrfToken = token.length > 0 ? token : null;

  if (!csrfToken) {
    throw new Error('CSRF token failed to initialize');
  }

  return csrfToken;
}
