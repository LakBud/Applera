import axios from 'axios';

export const rawClient = axios.create({
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
