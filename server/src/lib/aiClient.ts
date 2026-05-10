import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

// ── Provider detection ────────────────────────────────────────────────────────
export const isOllama: boolean = (process.env.AI_PROVIDER ?? "openai").toLowerCase() === "ollama";

// ── Strongly typed env access ────────────────────────────────────────────────
const OPENAI_API_KEY: string | undefined = process.env.OPENAI_API_KEY;
const OLLAMA_BASE_URL: string = process.env.OLLAMA_BASE_URL ?? "http://127.0.0.1:11434/v1";
const OLLAMA_MODEL: string = process.env.OLLAMA_MODEL ?? "llama3.2:3b";
const OPENAI_MODEL: string = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

// ── Fail Fast: catch missing API key before any request is ever made ──────────
if (!isOllama && !OPENAI_API_KEY) {
  throw new Error(
    "[aiClient] OPENAI_API_KEY is not set. " + "Add it to your .env file or set AI_PROVIDER=ollama to use a local model.",
  );
}

// ── Client ────────────────────────────────────────────────────────────────────
export const openai = new OpenAI({
  apiKey: isOllama ? "ollama" : OPENAI_API_KEY!,
  ...(isOllama && {
    baseURL: OLLAMA_BASE_URL,
  }),
});

// ── Model ─────────────────────────────────────────────────────────────────────
export const model: string = isOllama ? OLLAMA_MODEL : OPENAI_MODEL;

// ── Usage ─────────────────────────────────────────────────────────────────────
// import { openai, model, isOllama } from "../lib/aiClient.js";
