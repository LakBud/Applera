import axios from "axios";
import type { ApiError } from "./types";

export const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:5005",
  timeout: 90_000, // 90s — matches the server-side aiTimeout
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${import.meta.env.VITE_API_KEY ?? ""}`,
  },
});

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
