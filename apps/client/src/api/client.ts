import axios from 'axios';

import { requestInterceptor } from './interceptors/request.interceptor';
import { createResponseErrorInterceptor } from './interceptors/response.interceptor';

export const client = axios.create({
  baseURL: (() => {
    const url = import.meta.env.VITE_API_URL;
    if (!url) {
      throw new Error('VITE_API_URL is required');
    }
    return url;
  })(),
  timeout: 90_000,
  withCredentials: true,
});

client.interceptors.request.use(requestInterceptor);
client.interceptors.response.use((res) => res, createResponseErrorInterceptor);
