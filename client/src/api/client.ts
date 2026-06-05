import axios from "axios";
import type { ApiError } from "./types";

export const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:5005",
  timeout: 90_000,
  withCredentials: true,
});

// ── CSRF ──────────────────────────────────────────────────────────────────────

let csrfToken: string | null = null;

async function getCsrfToken(): Promise<string> {
  if (csrfToken) return csrfToken;
  const res = await client.get("/api/csrf-token");
  csrfToken = res.data.csrfToken;
  return csrfToken!;
}

const CSRF_SAFE = new Set(["GET", "HEAD", "OPTIONS"]);

client.interceptors.request.use(async (config) => {
  if (!CSRF_SAFE.has(config.method?.toUpperCase() ?? "")) {
    config.headers["x-csrf-token"] = await getCsrfToken();
  }
  return config;
});

// ── Response errors ───────────────────────────────────────────────────────────

client.interceptors.response.use(
  (res) => res,
  async (error) => {
    // Stale CSRF token — reset so next request fetches a fresh one
    if (error.response?.status === 403) {
      csrfToken = null;
    }

    const data: ApiError | undefined = error.response?.data;

    if (error.code === "ECONNABORTED") {
      return Promise.reject(new Error("Request timed out. Please try again."));
    }

    if (error.response?.status === 429) {
      return Promise.reject(new Error("Too many requests. Please wait a moment and try again."));
    }

    return Promise.reject(new Error(data?.error ?? error.message ?? "Something went wrong"));
  },
);
