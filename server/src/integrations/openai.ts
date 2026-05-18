import OpenAI from "openai";
import {
  IS_OLLAMA,
  IS_GROQ,
  OLLAMA_BASE_URL,
  OLLAMA_MODEL,
  GROQ_API_KEY,
  GROQ_BASE_URL,
  GROQ_MODEL,
  OPENAI_API_KEY,
  OPENAI_MODEL,
} from "../config/env.js";

if (!IS_OLLAMA && !IS_GROQ && !OPENAI_API_KEY) {
  throw new Error("[aiClient] OPENAI_API_KEY is not set. " + "Add it to your .env or set AI_PROVIDER=ollama / AI_PROVIDER=groq.");
}

export const openai = new OpenAI({
  apiKey: IS_GROQ ? GROQ_API_KEY : IS_OLLAMA ? "ollama" : OPENAI_API_KEY!,
  baseURL: IS_GROQ ? GROQ_BASE_URL : IS_OLLAMA ? OLLAMA_BASE_URL : undefined,
});

export const model: string = IS_GROQ ? GROQ_MODEL : IS_OLLAMA ? OLLAMA_MODEL : OPENAI_MODEL;

// ── Usage ─────────────────────────────────────────────────────────────────────
// import { openai, model, isOllama } from "../lib/aiClient.js";
