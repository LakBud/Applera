// All environment variables are validated and exported from here.
// Every other file imports from this — no scattered process.env calls.
// Throws at startup if a required variable is missing (Fail Fast).

import dotenv from "dotenv";
dotenv.config();

function requireEnv(key: string) {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}

function optionalEnv(key: string, fallback: string): string {
  return process.env[key] || fallback;
}

// ── Provider ──────────────────────────────────────────────────────────────────

export const IS_OLLAMA = optionalEnv("AI_PROVIDER", "openai").toLowerCase() === "ollama";
export const IS_PROD = optionalEnv("NODE_ENV", "development") === "production";

// ── AI ────────────────────────────────────────────────────────────────────────

export const OPENAI_API_KEY = IS_OLLAMA ? "ollama" : requireEnv("OPENAI_API_KEY");
export const OPENAI_MODEL = optionalEnv("OPENAI_MODEL", "gpt-4o-mini");
export const OLLAMA_BASE_URL = optionalEnv("OLLAMA_BASE_URL", "http://127.0.0.1:11434/v1");
export const OLLAMA_MODEL = optionalEnv("OLLAMA_MODEL", "llama3.2:3b");
export const AI_MODEL = IS_OLLAMA ? OLLAMA_MODEL : OPENAI_MODEL;

const env = {
  NODE_ENV: process.env.NODE_ENV,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
};

export default env;

// ── Server ────────────────────────────────────────────────────────────────────

export const PORT = optionalEnv("PORT", "5005");
export const CLIENT_URL = optionalEnv("CLIENT_URL", "http://localhost:5173");

// ── Database ──────────────────────────────────────────────────────────────────

export const MONGO_URI = requireEnv("MONGO_URI");
