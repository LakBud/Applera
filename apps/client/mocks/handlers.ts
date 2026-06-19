import { http, HttpResponse } from 'msw';

// Base URL should match whatever your axios client.ts uses
// (e.g. import.meta.env.VITE_API_URL). Add real handlers here as you
// write integration tests — one per endpoint your flow actually hits.
const API_URL = 'http://localhost:5005/api';

export const handlers = [
  // Example placeholder — replace with real endpoints as you test them.
  http.get(`${API_URL}/example`, () => {
    return HttpResponse.json({ message: 'mocked response' });
  }),
];
