import axios, { type InternalAxiosRequestConfig } from 'axios';

import { getCsrfToken, safeGetToken } from '../utils/auth';

let csrfToken: string | null = null;
let csrfTokenPromise: Promise<string> | null = null;
const CSRF_SAFE = new Set(['GET', 'HEAD', 'OPTIONS']);

async function getOrFetchCsrfToken(): Promise<string> {
  csrfTokenPromise ??= getCsrfToken(csrfToken)
    .then((t) => (csrfToken = t))
    .finally(() => (csrfTokenPromise = null));

  return csrfTokenPromise;
}

export function resetCsrfToken() {
  csrfToken = null;
  csrfTokenPromise = null;
}

export async function requestInterceptor(config: InternalAxiosRequestConfig) {
  config.headers ??= new axios.AxiosHeaders();

  const token = await safeGetToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;

  if (!CSRF_SAFE.has(config.method?.toUpperCase() ?? '')) {
    config.headers['x-csrf-token'] = await getOrFetchCsrfToken();
  }

  return config;
}
