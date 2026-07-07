import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

import { resetCsrfToken } from './request.interceptor';

import type { ApiError } from '../types';

interface RetryConfig extends InternalAxiosRequestConfig {
  _csrfRetried?: boolean;
}

export function createResponseErrorInterceptor(axiosInstance: ReturnType<typeof axios.create>) {
  return async function responseErrorInterceptor(error: unknown) {
    if (!axios.isAxiosError(error)) {
      return Promise.reject({ code: 'UNKNOWN', message: 'Something went wrong' });
    }

    const axiosError = error as AxiosError<ApiError>;
    const data = axiosError.response?.data;
    const status = axiosError.response?.status;
    const config = axiosError.config as RetryConfig | undefined;

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
        if (!window.location.pathname.startsWith('/auth/')) {
          window.location.replace('/auth/sign-up/');
        }
        return Promise.reject({ code: 'UNAUTHORIZED', message: data?.error || 'Unauthorized' });

      case 403:
        resetCsrfToken();
        if (config && !config._csrfRetried) {
          config._csrfRetried = true;
          return axiosInstance(config);
        }
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
  };
}
