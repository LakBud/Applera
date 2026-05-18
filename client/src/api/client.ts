import axios from "axios";
import type { ApiError } from "./types";

export const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:5005",
  timeout: 90_000, // 90s — matches the server-side aiTimeout
  withCredentials: true, // For clerk and stuff
});

client.interceptors.response.use(
  (res) => res,
  (error) => {
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
