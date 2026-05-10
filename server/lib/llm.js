// Single shared wrapper for all LLM calls.
// DRY: every service (extractors, matcher, generator) calls this

import { openai, model, isOllama } from "./aiClient.js";
import parseModelJson from "./parseModelJson.js";
import { IS_PROD } from "../config/env.js";

const MAX_RETRIES = 2;
const RETRY_BASE_MS = 500;

function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

/**
 * @param {object} options
 * @param {string}  options.systemPrompt
 * @param {string}  options.userContent
 * @param {number}  [options.temperature=0.2]
 * @param {boolean} [options.jsonMode=true]   Forces JSON output on OpenAI models
 * @returns {Promise<object>} Parsed JSON from the model
 */
export async function callLLM({ systemPrompt, userContent, temperature = 0.2, jsonMode = true }) {
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
        // response_format forces valid JSON on OpenAI; Ollama ignores it
        ...(jsonMode && !isOllama ? { response_format: { type: "json_object" } } : {}),
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent },
        ],
      });

      const content = response.choices?.[0]?.message?.content?.trim();

      if (!content) throw new Error("Model returned an empty response");

      if (!IS_PROD) console.debug("[llm] raw output:", content);

      return parseModelJson(content);
    } catch (err) {
      lastError = err;
    }
  }

  throw new Error(`[llm] Failed after ${MAX_RETRIES + 1} attempts: ${lastError?.message}`);
}
