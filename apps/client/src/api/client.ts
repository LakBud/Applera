import axios from 'axios';

import type { ApiError } from './types';
import { getCsrfToken, safeGetToken } from './utils/auth';

export const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:5005',
  timeout: 90_000,
  withCredentials: true,
});

let csrfToken: string | null = null;
const CSRF_SAFE = new Set(['GET', 'HEAD', 'OPTIONS']);

client.interceptors.request.use(async (config) => {
  // AUTH (safe)
  const token = await safeGetToken();

  if (token) {
    config.headers = config.headers ?? new axios.AxiosHeaders();
    config.headers.Authorization = `Bearer ${token}`;
  }

  // CSRF
  if (!CSRF_SAFE.has(config.method?.toUpperCase() ?? '')) {
    config.headers = config.headers ?? new axios.AxiosHeaders();
    config.headers['x-csrf-token'] = await getCsrfToken(csrfToken);
  }

  return config;
});

client.interceptors.response.use(
  (res) => res,
  async (error) => {
    const data: ApiError | undefined = error.response?.data;
    const status = error.response?.status;

    // NETWORK / TIMEOUT
    if (error.code === 'ECONNABORTED') {
      return Promise.reject({
        code: 'TIMEOUT',
        message: 'Request timed out. Please try again.',
      });
    }

    if (!error.response) {
      return Promise.reject({
        code: 'NETWORK_ERROR',
        message: 'Network error. Please check your connection.',
      });
    }

    // HTTP ERRORS
    switch (status) {
      case 401:
        window.location.replace('/auth/sign-up/');
        return Promise.reject({
          code: 'UNAUTHORIZED',
          message: data?.error || 'Unauthorized',
        });

      case 403:
        csrfToken = null;
        return Promise.reject({
          code: 'FORBIDDEN',
          message: data?.error || 'Forbidden',
        });

      case 404:
        return Promise.reject({
          code: 'NOT_FOUND',
          message: 'Not found',
        });

      case 429:
        return Promise.reject({
          code: 'RATE_LIMITED',
          message: 'Too many requests. Please wait and try again.',
        });

      case 402:
        if (data?.error === 'USAGE_LIMIT_REACHED') {
          return Promise.reject({
            code: 'USAGE_LIMIT_REACHED',
            message: data.message || 'Usage limit reached',
            meta: {
              limit: data.limit,
              count: data.count,
              remaining: 0,
            },
          });
        }
    }

    // FALLBACK ERROR
    return Promise.reject({
      code: 'UNKNOWN',
      message: data?.message || data?.error || error.message || 'Something went wrong',
    });
  },
);
