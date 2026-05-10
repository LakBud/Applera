import { openai, model, isOllama } from "./aiClient.js";
import parseModelJson from "./parseModelJson.js";
import env from "../config/env.js";
import type { ChatCompletion } from "openai/resources/chat/completions";

const MAX_RETRIES: number = 2;
const RETRY_BASE_MS: number = 500;

// ── Env ─────────────────────────────────────────────────────────────
const IS_PROD: boolean = env.NODE_ENV === "production";

// ── Utils ────────────────────────────────────────────────────────────
function sleep(ms: number): Promise<void> {
  return new Promise((res) => setTimeout(res, ms));
}

// ── PII-safe logger ──────────────────────────────────────────────────
function debugLog(label: string, content: unknown): void {
  if (IS_PROD) return;

  const requestId = crypto.randomUUID?.() ?? "dev";

  let output: string;

  try {
    if (typeof content === "string") {
      output = content;
    } else {
      output = JSON.stringify(content, null, 2);
    }
  } catch {
    output = String(content);
  }

  const preview = output.length > 800 ? output.slice(0, 800) + `… [${output.length - 800} chars truncated]` : output;

  console.debug(`\n[llm:${requestId}] ${label}:\n${preview}\n`);
}

// ── Main LLM call ────────────────────────────────────────────────────
type CallLLMParams = {
  systemPrompt: string;
  userContent: string;
  temperature?: number;
  jsonMode?: boolean;
  maxTokens?: number;
};

export async function callLLM({
  systemPrompt,
  userContent,
  temperature = 0.2,
  jsonMode = true,
  maxTokens = 2000,
}: CallLLMParams) {
  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      const delay = RETRY_BASE_MS * attempt;
      const message = lastError instanceof Error ? lastError.message : "Unknown error";

      console.warn(`[llm] Retry ${attempt}/${MAX_RETRIES} in ${delay}ms — ${message}`);

      await sleep(delay);
    }

    try {
      const response: ChatCompletion = await openai.chat.completions.create({
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

      if (!content) {
        throw new Error("Model returned an empty response");
      }

      debugLog("raw output", content);

      return parseModelJson(content);
    } catch (err: unknown) {
      lastError = err;
    }
  }

  const message = lastError instanceof Error ? lastError.message : "Unknown error";

  throw new Error(`[llm] Failed after ${MAX_RETRIES + 1} attempts: ${message}`);
}
