// Injection detection

const INJECTION_PATTERNS = [
  // English - ignore/disregard variants
  /ign[o0]re (all |previous |the |above |any )*inst?r[uo]ctions?/i,
  /disregard (all |previous |the |above |any )*inst?r[uo]ctions?/i,
  /do not follow (your |any |the |previous )?inst?r[uo]ctions?/i,
  /override (your |all |previous )?inst?r[uo]ctions?/i,

  // Identity/role hijacking
  /you are now/i,
  /you will now (act|behave|pretend|respond)/i,
  /\bact as (a |an )?(different |new )?(ai|assistant|model|persona|character|chatbot)\b/i,
  /pretend (you are|to be)/i,
  /new (persona|role|identity|mode)/i,
  /your (new |true )?role is/i,
  /from now on/i,

  // Forgetting
  /forget (everything|all|your (instructions?|training|rules|guidelines))/i,
  /reset (your )?(instructions?|context|memory|training)/i,

  // System prompt leaking/override
  /system\s*:/i,
  /<\s*system\s*>/i,
  /reveal (your )?(system |initial |original )?(prompt|instructions?)/i,
  /what (are|were) your (original |system |initial )?instructions?/i,
  /repeat (your )?(system |initial |original )?(prompt|instructions?)/i,

  // DAN / jailbreak patterns
  /do anything now/i,
  /jailbreak/i,
  /developer\s*mode/i,
  /(enable|activate|switch to) (unrestricted|unlimited|unsafe|unfiltered) mode/i,
  /no (restrictions?|limits?|filters?|guidelines?|rules?)/i,

  // Norwegian
  /se bort fra/i,
  /ignorer (alle |tidligere |instruksjonene|reglene)+/i,
  /glem (alt|instruksjonene|hva du ble fortalt|reglene)/i,
  /du er n(å|a) en/i,
  /ny (assistent|persona|rolle|identitet)/i,
  /fra n(å|a) av/i,
  /late som (du er|om)/i,

  // Structural injection
  /```\s*(system|instructions?|prompt|override)/i,
  /\[INST\]/i,
  /<\|system\|>/i,
  /<\|im_start\|>/i, // ChatML format
  /###\s*instruction/i, // Alpaca format
  /^\s*human\s*:/im, // conversation format spoofing
  /^\s*assistant\s*:/im,
];

export function detectInjection(text: string): boolean {
  return INJECTION_PATTERNS.some((pattern) => pattern.test(text));
}

// Input sanitization

export function sanitise(text: string, label: string, MAX_INPUT_LENGTH: number = 20_000): string {
  if (!text.trim()) {
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

// NoSQL sanitiser func
export function stripObject(obj: unknown): void {
  if (!obj || typeof obj !== 'object') return;

  if (Array.isArray(obj)) {
    obj.forEach(stripObject);
    return;
  }

  for (const key of Object.keys(obj as Record<string, unknown>)) {
    const value = (obj as Record<string, unknown>)[key];
    if (key.startsWith('$') || key.includes('.')) {
      delete (obj as Record<string, unknown>)[key];
    } else {
      stripObject(value);
    }
  }
}

export function maskIp(ip: string): string {
  // IPv6
  if (ip.includes(':')) {
    const parts = ip.split(':');
    parts[parts.length - 1] = 'xxxx';
    parts[parts.length - 2] = 'xxxx';
    return parts.join(':');
  }

  // IPv4
  return ip.replace(/\.\d+$/, '.xxx');
}
