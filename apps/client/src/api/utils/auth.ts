import { rawClient } from '@/api/rawClient';

import { getToken } from '@clerk/react';

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
  const token = res?.data?.csrfToken;
  csrfToken = typeof token === 'string' && token.trim().length > 0 ? token : null;

  if (!csrfToken) {
    throw new Error('CSRF token failed to initialize');
  }

  return csrfToken;
}
