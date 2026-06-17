import { type AxiosError } from 'axios';

import type { ApiError } from '../types';
import { resetCsrfToken } from './request.interceptor';

export async function responseErrorInterceptor(error: unknown) {
  const axiosError = error as AxiosError<ApiError>;
  const data = axiosError.response?.data;
  const status = axiosError.response?.status;

  if (axiosError.code === 'ECONNABORTED') {
    return Promise.reject({ code: 'TIMEOUT', message: 'Request timed out. Please try again.' });
  }

  if (!axiosError.response) {
    return Promise.reject({
      code: 'NETWORK_ERROR',
      message: 'Network error. Please check your connection.',
    });
  }

  switch (status) {
    case 401:
      window.location.replace('/auth/sign-up/');
      return Promise.reject({ code: 'UNAUTHORIZED', message: data?.error || 'Unauthorized' });

    case 403:
      resetCsrfToken();
      return Promise.reject({ code: 'FORBIDDEN', message: data?.error || 'Forbidden' });

    case 404:
      return Promise.reject({ code: 'NOT_FOUND', message: 'Not found' });

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
            remaining: data.remaining,
          },
        });
      }
  }

  return Promise.reject({
    code: 'UNKNOWN',
    message: data?.message || data?.error || axiosError.message || 'Something went wrong',
  });
}
