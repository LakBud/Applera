import OpenAI from "openai";
import { IS_OLLAMA, OLLAMA_BASE_URL, OLLAMA_MODEL, OPENAI_API_KEY, OPENAI_MODEL } from "../config/env.js";

// ── Fail Fast: catch missing API key before any request is ever made ──────────
if (!IS_OLLAMA && !OPENAI_API_KEY) {
  throw new Error(
    "[aiClient] OPENAI_API_KEY is not set. " + "Add it to your .env file or set AI_PROVIDER=ollama to use a local model.",
  );
}

// ── Client ────────────────────────────────────────────────────────────────────
export const openai = new OpenAI({
  apiKey: IS_OLLAMA ? "ollama" : OPENAI_API_KEY!,
  ...(IS_OLLAMA && {
    baseURL: OLLAMA_BASE_URL,
  }),
});

// ── Model ─────────────────────────────────────────────────────────────────────
export const model: string = IS_OLLAMA ? OLLAMA_MODEL : OPENAI_MODEL;

// ── Usage ─────────────────────────────────────────────────────────────────────
// import { openai, model, isOllama } from "../lib/aiClient.js";
