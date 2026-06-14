export default function parseModelJson<T = unknown>(raw: string): T {
  if (!raw || typeof raw !== 'string') {
    throw new Error('parseModelJson: input must be a non-empty string');
  }

  const text = raw.trim();

  // ── fenced block ───────────────────────────────
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch) {
    return tryParse<T>(fenceMatch[1].trim(), 'fenced block');
  }

  // ── raw object ────────────────────────────────
  if (text.startsWith('{')) {
    return tryParse<T>(text, 'raw JSON');
  }

  // ── first balanced object (IMPORTANT FIX) ─────
  const extracted = extractFirstJsonBlock(text);
  if (extracted) {
    return tryParse<T>(extracted, 'first object block');
  }

  throw new Error('parseModelJson: could not find valid JSON');
}

function extractFirstJsonBlock(text: string): string {
  let depth = 0;
  let start = -1;

  for (let i = 0; i < text.length; i++) {
    if (text[i] === '{') {
      if (depth === 0) {
        start = i;
      }
      depth++;
    }

    if (text[i] === '}') {
      depth--;
      if (depth === 0 && start !== -1) {
        return text.slice(start, i + 1);
      }
    }
  }

  return '';
}

function tryParse<T>(str: string, source: string): T {
  try {
    return JSON.parse(str) as T;
  } catch {
    throw new Error(`parseModelJson error (${source})\nPreview: ${str.slice(0, 200)}`);
  }
}
