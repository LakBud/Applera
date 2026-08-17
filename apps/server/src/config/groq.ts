import OpenAI from 'openai';

import { GROQ_API_KEY, GROQ_BASE_URL, GROQ_MODEL } from './env.js';

export const groq = new OpenAI({
  apiKey: GROQ_API_KEY,
  baseURL: GROQ_BASE_URL,
});

export const groq_model: string = GROQ_MODEL;
