import OpenAI from 'openai';

import { MISTRAL_API_KEY, MISTRAL_BASE_URL, MISTRAL_MODEL } from './env.js';

// Mistral's API is OpenAI wire compatible, so the OpenAI SDK talks to it directly once pointed
// at Mistral's base URL. VernLLM's fromMistral adapter wraps it the same way fromGroq wraps
// the Groq client.
export const mistral = new OpenAI({
  apiKey: MISTRAL_API_KEY,
  baseURL: MISTRAL_BASE_URL,
});

export const mistralModel: string = MISTRAL_MODEL;
