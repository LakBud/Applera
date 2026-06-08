import { openai, model } from "../../integrations/openai.js";
import parseModelJson from "../../lib/parseModelJson.js";
import { getCache, setCache } from "../../lib/cache.js";
import { randomUUID } from "crypto";
import { IS_PROD } from "../../config/env.js";

const BASE_DELAY_MS = 500;

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

const MAX_RETRIES = 1; // 2 attempts max
const TIMEOUT_MS = 25_000; // 25s per attempt → ~52s worst case, well under 90s

function withTimeout<T>(fn: (signal: AbortSignal) => Promise<T>, ms: number): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);
  return fn(controller.signal).finally(() => clearTimeout(timeout));
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
  maxTokens = 1000,
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

      const response = await withTimeout(
        (signal) =>
          openai.chat.completions.create(
            {
              model,
              temperature,
              max_tokens: maxTokens,
              ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userContent },
              ],
            },
            { signal },
          ),
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
