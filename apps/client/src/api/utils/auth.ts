import { client } from '@/api/client';

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
  if (csrfToken) return csrfToken;

  const res = await client.get('/api/csrf-token');
  csrfToken = res.data.csrfToken;

  if (!csrfToken) {
    throw new Error('CSRF token failed to initialize');
  }

  return csrfToken;
}
