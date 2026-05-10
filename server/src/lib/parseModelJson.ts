// Extracts valid JSON from LLM output regardless of how the model wraps it.
//
// Models frequently return one of these formats even when told not to:
//   1. Raw JSON                          { "name": "..." }
//   2. Markdown code block               ```json\n{ ... }\n```
//   3. Markdown without language tag     ```\n{ ... }\n```
//   4. JSON with leading explanation     "Here is the result:\n{ ... }"
//   5. JSON with trailing explanation    { ... }\nLet me know if...
//   6. Multiple JSON objects             { ... }\n{ ... }  ← take the first

export default function parseModelJson<T = unknown>(raw: string): T {
  if (!raw || typeof raw !== "string") {
    throw new Error("parseModelJson: input must be a non-empty string");
  }

  const text = raw.trim();

  // ── Strategy 1: strip markdown code fences ───────────────────────────────
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch) {
    return tryParse<T>(fenceMatch[1].trim(), "fenced block");
  }

  // ── Strategy 2: raw JSON ──────────────────────────────────────────────────
  if (text.startsWith("{") || text.startsWith("[")) {
    return tryParse<T>(text, "raw JSON");
  }

  // ── Strategy 3: first object block ───────────────────────────────────────
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");

  if (firstBrace !== -1 && lastBrace > firstBrace) {
    return tryParse<T>(text.slice(firstBrace, lastBrace + 1), "extracted block");
  }

  // ── Strategy 4: array block ───────────────────────────────────────────────
  const firstBracket = text.indexOf("[");
  const lastBracket = text.lastIndexOf("]");

  if (firstBracket !== -1 && lastBracket > firstBracket) {
    return tryParse<T>(text.slice(firstBracket, lastBracket + 1), "extracted array");
  }

  throw new Error("parseModelJson: could not find valid JSON in model output");
}

function tryParse<T>(str: string, source: string): T {
  try {
    return JSON.parse(str) as T;
  } catch {
    throw new Error(`parseModelJson: invalid JSON in ${source}: ${str.slice(0, 100)}`);
  }
}
