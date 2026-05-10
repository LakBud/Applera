// Shared axios instance. All API modules import from here.
// Configure base URL and timeout once — never scattered across files.

import axios from "axios";
import type { ApiError } from "./types";

export const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:5005",
  timeout: 60_000, // 60s — AI calls can be slow
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Response interceptor ──────────────────────────────────────────────────────
// Normalises every error into a plain Error with a readable message,
// so hooks and components never need to inspect axios internals.

client.interceptors.response.use(
  (response) => response,
  (error) => {
    const data: ApiError | undefined = error.response?.data;

    if (error.code === "ECONNABORTED") {
      return Promise.reject(new Error("Request timed out. Please try again."));
    }

    const message = data?.error ?? error.message ?? "Something went wrong. Please try again.";

    return Promise.reject(new Error(message));
  },
);
