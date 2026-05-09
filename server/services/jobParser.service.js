import OpenAI from "openai";
import dotenv from "dotenv";
import { parseModelJson } from "./parseModelJson.js";

dotenv.config();

const provider = (process.env.AI_PROVIDER || "openai").toLowerCase();
const isOllama = provider === "ollama";

const openai = new OpenAI({
  apiKey: isOllama ? "ollama" : process.env.OPENAI_API_KEY,
  ...(isOllama && {
    baseURL: process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434/v1",
  }),
});

const model = isOllama ? process.env.OLLAMA_MODEL || "llama3.2:3b" : process.env.OPENAI_MODEL || "gpt-4o-mini";

export async function parseJob(jobText) {
  const response = await openai.chat.completions.create({
    model,
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content: `
You are a JSON extraction engine.

STRICT RULES (must follow):
- Output ONLY valid JSON
- NO explanations
- NO markdown
- NO \`\`\` blocks
- NO extra text before or after JSON
- Output must start with { and end with }

JSON schema:

{
  "title": "string",
  "required_skills": ["string"],
  "responsibilities": ["string"],
  "seniority": "string"
}

Rules:
- If unknown, use empty string or empty array
`.trim(),
      },
      {
        role: "user",
        content: jobText,
      },
    ],
  });

  const content = response.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("Empty AI response");
  }

  return parseModelJson(content);
}
