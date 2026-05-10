// ─────────────────────────────────────────────────────────────────────────────
// Bootstrap file for the AI provider.
// Import { openai, model, isOllama } wherever you need to make LLM calls.
// All provider-switching, env loading, and validation happens here — once.
// ─────────────────────────────────────────────────────────────────────────────

import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

// ── Provider detection ────────────────────────────────────────────────────────

export const isOllama = (process.env.AI_PROVIDER || "openai").toLowerCase() === "ollama";

// ── Fail Fast: catch missing API key before any request is ever made ──────────

if (!isOllama && !process.env.OPENAI_API_KEY) {
  throw new Error(
    "[aiClient] OPENAI_API_KEY is not set. " + "Add it to your .env file or set AI_PROVIDER=ollama to use a local model.",
  );
}

// ── Client ────────────────────────────────────────────────────────────────────

export const openai = new OpenAI({
  apiKey: isOllama ? "ollama" : process.env.OPENAI_API_KEY,
  ...(isOllama && {
    baseURL: process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434/v1",
  }),
});

// ── Model ─────────────────────────────────────────────────────────────────────

export const model = isOllama ? process.env.OLLAMA_MODEL || "llama3.2:3b" : process.env.OPENAI_MODEL || "gpt-4o-mini";

// ── Usage ─────────────────────────────────────────────────────────────────────
// import { openai, model, isOllama } from "../lib/aiClient.js";
