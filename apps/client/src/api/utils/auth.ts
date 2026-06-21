import { getToken } from '@clerk/react';

import { rawClient } from '@/api/rawClient';

export async function safeGetToken(): Promise<string | null> {
  try {
    const token = await getToken();
    return token ?? null;
  } catch {
    // Clerk not ready yet → silently ignore
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
