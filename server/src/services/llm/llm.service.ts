import { openai, model } from "../../integrations/openai.js";
import parseModelJson from "../../lib/parseModelJson.js";
import env from "../../config/env.js";
import type { ChatCompletion } from "openai/resources/chat/completions";
import { getCache, setCache } from "../../lib/cache.js";
import { randomUUID } from "crypto";

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 500;
const TIMEOUT_MS = 30_000;

const IS_PROD = env.NODE_ENV === "production";

// ─────────────────────────────────────────────
// Error class
// ─────────────────────────────────────────────

export class LLMError extends Error {
  constructor(
    message: string,
    public type: "timeout" | "api" | "parse" | "unknown",
  ) {
    super(message);
  }
}

// ─────────────────────────────────────────────
// Timeout wrapper
// ─────────────────────────────────────────────

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  const controller = new AbortController();

  const timeout = setTimeout(() => controller.abort(), ms);

  return Promise.race([
    promise.finally(() => clearTimeout(timeout)),
    new Promise<T>((_, reject) => setTimeout(() => reject(new LLMError("Timeout", "timeout")), ms)),
  ]);
}

// ─────────────────────────────────────────────
// Debug logger (safe in dev only)
// ─────────────────────────────────────────────

function debugLog(label: string, content: unknown, requestId: string): void {
  if (IS_PROD) return;

  const safe = typeof content === "string" ? content : JSON.stringify(content, null, 2);

  console.debug(`\n[llm:${requestId}] ${label}:\n${safe.slice(0, 800)}\n`);
}

// ─────────────────────────────────────────────
// Main LLM call (RAW JSON)
// ─────────────────────────────────────────────

type CallLLMParams = {
  systemPrompt: string;
  userContent: string;
  temperature?: number;
  jsonMode?: boolean;
  maxTokens?: number;
  requestId?: string;
};

export async function callLLM({
  systemPrompt,
  userContent,
  temperature = 0.2,
  jsonMode = true,
  maxTokens = 2000,
  requestId = randomUUID(),
}: CallLLMParams): Promise<unknown> {
  let lastError: unknown;

  const totalAttempts = MAX_RETRIES + 1;

  for (let attempt = 0; attempt < totalAttempts; attempt++) {
    try {
      if (attempt > 0) {
        const delay = BASE_DELAY_MS * 2 ** attempt;

        console.warn(`[llm:${requestId}] retry ${attempt}/${MAX_RETRIES} in ${delay}ms`);

        await new Promise((r) => setTimeout(r, delay));
      }

      const response: ChatCompletion = await withTimeout(
        openai.chat.completions.create({
          model,
          temperature,
          max_tokens: maxTokens,
          ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userContent },
          ],
        }),
        TIMEOUT_MS,
      );

      const content = response.choices?.[0]?.message?.content?.trim();

      if (!content) {
        throw new LLMError("Empty response", "api");
      }

      debugLog("raw output", content, requestId);

      const parsed = parseModelJson(content);

      if (!parsed) {
        throw new LLMError("Parse failed", "parse");
      }

      return parsed;
    } catch (err) {
      lastError = err;

      if (err instanceof LLMError && err.type === "parse") {
        break;
      }
    }
  }

  throw new LLMError(
    `LLM failed after ${totalAttempts} attempts: ${lastError instanceof Error ? lastError.message : "unknown"}`,
    "unknown",
  );
}

// ─────────────────────────────────────────────
// Cached LLM wrapper (ZOD will validate OUTSIDE this)
// ─────────────────────────────────────────────

export async function cachedLLM<T>({ cacheKey, ttl, fn }: { cacheKey: string; ttl: number; fn: () => Promise<T> }): Promise<T> {
  const cached = await getCache<T>(cacheKey);
  if (cached) return cached;

  const result = await fn();

  await setCache(cacheKey, result, ttl);
  return result;
}
