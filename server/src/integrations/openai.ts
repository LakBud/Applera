import OpenAI from 'openai';
import { GROQ_API_KEY, GROQ_BASE_URL, GROQ_MODEL } from '../config/env.js';

export const openai = new OpenAI({
  apiKey: GROQ_API_KEY,
  baseURL: GROQ_BASE_URL,
});

export const model: string = GROQ_MODEL;

// ── Usage ─────────────────────────────────────────────────────────────────────
// import { openai, model, isOllama } from "../lib/aiClient.js";
