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

const SYSTEM_PROMPT = `
You are a professional Norwegian career assistant.

You generate structured job application data.

ABSOLUTE RULES:
- Output ONLY valid JSON (no markdown, no backticks, no explanation)
- Response must start with { and end with }
- NEVER include placeholders like [name], [company], [x]
- If unknown, use empty string ""
- Use \\n for line breaks inside strings
- Do not invent fake companies or names

OUTPUT FIELDS:
- cv_summary: string (3–5 lines, professional Norwegian)
- application_letter: object with:
  - introduction
  - body
  - closing
- email_template: object with:
  - subject
  - body

STYLE:
- Natural Norwegian
- Human tone (not robotic)
- Tailored to job description

ADDITIONAL STRICT RULES:

- NEVER use backslash escaped placeholders like \[name] or \[company]
- NEVER use any form of brackets [], {} or placeholder-style text
- NEVER include English words like "apply", "CV", "GitHub URL phrasing in sentence"
- Use ONLY natural Norwegian phrasing
- Emails must be properly formatted with real line breaks using \\n only (not literal line breaks)
- Endings must always be natural Norwegian sign-offs (e.g. "Vennlig hilsen") or empty string if unknown
`.trim();

export async function generateApplication(cv, job, match, retries = 2) {
  try {
    const response = await openai.chat.completions.create({
      model,
      temperature: 0.3,

      // IMPORTANT: forces JSON output (OpenAI models only)
      ...(isOllama ? {} : { response_format: { type: "json_object" } }),

      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: `
CV:
${JSON.stringify(cv, null, 2)}

JOB:
${JSON.stringify(job, null, 2)}

MATCH (DO NOT RECOMPUTE):
${JSON.stringify(match, null, 2)}

TASK:
Generate the structured job application JSON.
          `.trim(),
        },
      ],
    });

    const content = response.choices?.[0]?.message?.content;

    if (!content) throw new Error("Empty AI response");

    return parseModelJson(content);
  } catch (err) {
    // AUTO-RETRY if JSON breaks
    if (retries > 0) {
      console.warn(`Retrying AI generation... (${retries})`);
      return generateApplication(cv, job, match, retries - 1);
    }

    throw err;
  }
}
