// ─────────────────────────────────────────────────────────────
// Injection detection
// ─────────────────────────────────────────────────────────────

const INJECTION_PATTERNS = [
  /ignore (all |previous |the |above )?instructions?/i,
  /disregard (all |previous |the |above )?instructions?/i,
  /you are now/i,
  /new persona/i,
  /forget (everything|all|your instructions)/i,
  /system\s*:/i,
  /<\s*system\s*>/i,
];

export function detectInjection(text: string): boolean {
  return INJECTION_PATTERNS.some((pattern) => pattern.test(text));
}

// ─────────────────────────────────────────────────────────────
// Input sanitization
// ─────────────────────────────────────────────────────────────

const MAX_INPUT_LENGTH = 20_000;

export function sanitise(text: string, label: string): string {
  if (typeof text !== "string" || !text.trim()) {
    throw new TypeError(`[extractors] "${label}" must be non-empty`);
  }

  if (text.length > MAX_INPUT_LENGTH) {
    throw new Error(`[extractors] "${label}" too large`);
  }

  if (detectInjection(text)) {
    throw new Error(`[extractors] "${label}" blocked (injection detected)`);
  }

  return text.trim();
}
