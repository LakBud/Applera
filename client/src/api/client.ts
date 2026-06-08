import axios from "axios";
import type { ApiError } from "./types";
import { safeGetToken } from "./auth";

export const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:5005",
  timeout: 90_000,
  withCredentials: true,
});

let csrfToken: string | null = null;

const CSRF_SAFE = new Set(["GET", "HEAD", "OPTIONS"]);

async function getCsrfToken(): Promise<string> {
  if (csrfToken) return csrfToken;

  const res = await client.get("/api/csrf-token");
  csrfToken = res.data.csrfToken;

  if (!csrfToken) {
    throw new Error("CSRF token failed to initialize");
  }

  return csrfToken;
}

client.interceptors.request.use(async (config) => {
  // -----------------------------
  // AUTH (safe)
  // -----------------------------
  const token = await safeGetToken();

  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  // -----------------------------
  // CSRF
  // -----------------------------
  if (!CSRF_SAFE.has(config.method?.toUpperCase() ?? "")) {
    config.headers = config.headers ?? {};
    config.headers["x-csrf-token"] = await getCsrfToken();
  }

  return config;
});

client.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 403) {
      csrfToken = null;
    }

    const data: ApiError | undefined = error.response?.data;

    if (error.code === "ECONNABORTED") {
      return Promise.reject(new Error("Request timed out. Please try again."));
    }

    if (error.response?.status === 429) {
      return Promise.reject(new Error("Too many requests. Please wait and try again."));
    }

    return Promise.reject(new Error(data?.error ?? error.message ?? "Something went wrong"));
  },
);
