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

export async function extractCVData(cvText) {
  const response = await openai.chat.completions.create({
    model,
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content: `
You are a CV parser.

CRITICAL RULES:
- Return ONLY ONE valid JSON object
- Do NOT output multiple JSON objects
- Do NOT split sections
- Do NOT include explanations or text
- Do NOT use markdown or code blocks

Return format:

{
  "name": "",
  "email": "",
  "phone": "",
  "github": "",
  "summary": "",
  "seniority_level": "",
  "skills": [],
  "experience": [
    {
      "title": "",
      "company": "",
      "highlights": []
    }
  ],
  "education": [
    {
      "title": "",
      "school": ""
    }
  ]
}
`.trim(),
      },
      {
        role: "user",
        content: cvText,
      },
    ],
  });

  const content = response.choices?.[0]?.message?.content || "";

  console.log("RAW AI OUTPUT:", content);

  if (!content) {
    throw new Error("Empty AI response");
  }

  return parseModelJson(content);
}

export async function extractJobData(jobText) {
  const response = await openai.chat.completions.create({
    model,
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content: `
You are a professional job description parser.

CRITICAL RULES:
- Return ONLY valid JSON
- Do NOT include explanations, markdown, or extra text
- Do NOT guess or invent information
- ONLY extract information explicitly written in the job description
- If a field is not mentioned, return an empty string or empty array

STRICT EXTRACTION RULES:
- required_skills must ONLY include skills explicitly written in the text
- Do NOT infer skills (e.g. do NOT assume Node.js if only "JavaScript" is mentioned)
- responsibilities must be directly copied or clearly paraphrased from the text ONLY
- seniority must be inferred ONLY if explicitly indicated (e.g. "junior", "senior", "mid-level")

Return format:

{
  "title": "",
  "required_skills": [],
  "responsibilities": [],
  "seniority": ""
}
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
