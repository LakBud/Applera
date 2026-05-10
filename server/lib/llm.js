import { openai, model, isOllama } from "./aiClient.js";
import parseModelJson from "./parseModelJson.js";
import { IS_PROD } from "../config/env.js";

const MAX_RETRIES = 2;
const RETRY_BASE_MS = 500;

function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

// ── PII-safe logger ───────────────────────────────────────────────────────────
// CV text contains names, emails, phone numbers, and addresses.
// Logging raw LLM output in dev is useful for debugging but must never
// log the user content that was sent — only the response received.
function debugLog(label, content) {
  if (IS_PROD) return;
  // Truncate to 300 chars so full CV/job data never appears in logs
  const preview = content.length > 300 ? content.slice(0, 300) + `… [${content.length - 300} chars truncated]` : content;
  console.debug(`[llm] ${label}:`, preview);
}

export async function callLLM({ systemPrompt, userContent, temperature = 0.2, jsonMode = true, maxTokens = 2000 }) {
  let lastError;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      const delay = RETRY_BASE_MS * attempt;
      console.warn(`[llm] Retry ${attempt}/${MAX_RETRIES} in ${delay}ms — ${lastError?.message}`);
      await sleep(delay);
    }

    try {
      const response = await openai.chat.completions.create({
        model,
        temperature,
        max_tokens: maxTokens,
        ...(jsonMode && !isOllama ? { response_format: { type: "json_object" } } : {}),
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent },
        ],
      });

      const content = response.choices?.[0]?.message?.content?.trim();
      if (!content) throw new Error("Model returned an empty response");

      debugLog("raw output", content); // truncated, never logs user input
      return parseModelJson(content);
    } catch (err) {
      lastError = err;
    }
  }

  throw new Error(`[llm] Failed after ${MAX_RETRIES + 1} attempts: ${lastError?.message}`);
}
