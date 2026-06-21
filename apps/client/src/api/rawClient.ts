import axios from 'axios';

export const rawClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:5005',
  timeout: 90_000,
  withCredentials: true,
});
