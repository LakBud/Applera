import crypto from "crypto";

function sha256(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex");
}

export function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`;
  }

  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).sort();

  return `{${keys.map((k) => `"${k}":${stableStringify(obj[k])}`).join(",")}}`;
}

export function assertObject(label: string, value: unknown): asserts value is Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError(`[generateApplication] "${label}" must be a plain object`);
  }
}

// ── Cache key builder ───────────────────────────────────────────────────

export function buildCacheKey(...inputs: unknown[]): string {
  return sha256(stableStringify(inputs));
}
// ── Placeholder scrubber ───────────────────────────────────────────────

export function scrubPlaceholders(value: unknown): unknown {
  if (typeof value === "string") {
    return value
      .replace(/\[.*?\]/g, "")
      .replace(/\s{2,}/g, " ")
      .trim();
  }

  if (Array.isArray(value)) {
    return value.map(scrubPlaceholders);
  }

  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = scrubPlaceholders(v);
    }
    return out;
  }

  return value;
}
