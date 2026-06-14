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
