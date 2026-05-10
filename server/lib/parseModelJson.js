// Extracts valid JSON from LLM output regardless of how the model wraps it.
//
// Models frequently return one of these formats even when told not to:
//   1. Raw JSON                          { "name": "..." }
//   2. Markdown code block               ```json\n{ ... }\n```
//   3. Markdown without language tag     ```\n{ ... }\n```
//   4. JSON with leading explanation     "Here is the result:\n{ ... }"
//   5. JSON with trailing explanation    { ... }\nLet me know if...
//   6. Multiple JSON objects             { ... }\n{ ... }  ← take the first

export default function parseModelJson(raw) {
  if (!raw || typeof raw !== "string") {
    throw new Error("parseModelJson: input must be a non-empty string");
  }

  const text = raw.trim();

  // ── Strategy 1: strip markdown code fences and parse directly ────────────
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch) {
    return tryParse(fenceMatch[1].trim(), "fenced block");
  }

  // ── Strategy 2: raw JSON (ideal case) ────────────────────────────────────
  if (text.startsWith("{") || text.startsWith("[")) {
    return tryParse(text, "raw JSON");
  }

  // ── Strategy 3: extract first {...} block from mixed text ─────────────────
  // Handles "Here is the result: { ... } Hope that helps!"
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");

  if (firstBrace !== -1 && lastBrace > firstBrace) {
    return tryParse(text.slice(firstBrace, lastBrace + 1), "extracted block");
  }

  // ── Strategy 4: extract first [...] array block ───────────────────────────
  const firstBracket = text.indexOf("[");
  const lastBracket = text.lastIndexOf("]");

  if (firstBracket !== -1 && lastBracket > firstBracket) {
    return tryParse(text.slice(firstBracket, lastBracket + 1), "extracted array");
  }

  throw new Error(`parseModelJson: could not find valid JSON in model output`);
}

function tryParse(str, source) {
  try {
    return JSON.parse(str);
  } catch {
    throw new Error(`parseModelJson: invalid JSON in ${source}: ${str.slice(0, 100)}`);
  }
}
