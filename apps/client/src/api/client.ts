import axios from 'axios';

import { requestInterceptor } from './interceptors/request.interceptor';
import { responseErrorInterceptor } from './interceptors/response.interceptor';

export const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:5005',
  timeout: 90_000,
  withCredentials: true,
});

client.interceptors.request.use(requestInterceptor);
client.interceptors.response.use((res) => res, responseErrorInterceptor);
