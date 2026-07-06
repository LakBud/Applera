// Injection detection

// signals that user is trying to override behavior, issue instructions, or manipulate control flow
const INTENT_PATTERNS: RegExp[] = [
  // Instruction override (must include target)
  /\b(ignore|disregard|override)\b.*\b(instr[uo]ctions?|rules?|guidelines?)\b/i,
  /\bdo not follow\b.*\b(instr[uo]ctions?|rules?|guidelines?)\b/i,

  // Role / behavior change (MUST be verb-driven AND target an identity/system role)
  /\bact as\b.*\b(an? )?(ai|assistant|chatbot|system|bot|language model|llm|gpt|dan)\b/i,
  /\bpretend (to be|you are)\b/i,

  /\b(assume|adopt|switch to|take on)\b.*\b(new )?(role|identity|persona|mode)\b/i,

  /\byour (new |true )?role is\b/i,
  /\byour new role\b/i,

  // Norwegian: ONLY directive forms (this fixes your failing tests)
  /\bfra nå av (skal|må|vil|må du)\b/i,
  /\bfra n[åa] av\b/i,
  /\bdu (skal|må|vil) (nå )?(være|opptre som|fungere som)\s+(?:en\s+)?(?:ai|assistent|bot|chatbot|system|språkmodell|llm|gpt)\b/i,
  /\blate som (du er|om)\b/i,
  /\boppfør deg som\b/i,

  // Reset / memory manipulation
  /\b(forget|reset)\b.*\b(instr[uo]ctions?|rules?|guidelines?|memory|context)\b/i,

  // System prompt leakage
  /\b(system\s*:|<\s*system\s*>)/i,
  /\b(reveal|repeat)\b.*\b(system|prompt|instr[uo]ctions?)\b/i,
  /\bwhat (are|were)\b.*\b(your|system)\b.*\binstr[uo]ctions?\b/i,

  // Jailbreak / mode switching
  /\b(jailbreak|developer mode|do anything now)\b/i,
  /(enable|activate|switch to)\b.*\b(unrestricted|unlimited|unsafe|unfiltered)\b/i,
  /\bno (restrictions?|limits?|filters?|rules?)\b/i,

  // Structural injection
  /```\s*(system|instr[uo]ctions?|prompt|override)/i,
  /\[INST\]/i,
  /<\|im_start\|>/i,
  /<\|system\|>/i,
  /###\s*instr[uo]ction/i,

  // IMPORTANT: must be line-start only (fixes your false-positive safety test)
  /^\s*(human|assistant)\s*:/im,
  /\bfrom now on\b/i,
  /\bnew identity mode\b/i,
];

// suspicious payload words/phrases often used in injections
const CONCEPT_PATTERNS: RegExp[] = [
  /\bjailbreak\b/i,
  /\bdeveloper mode\b/i,
  /\bnew (identity|mode|persona)\b/i,
  /\byour new role\b/i,
];

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/0/g, 'o')
    .replace(/1/g, 'i')
    .replace(/3/g, 'e')
    .replace(/4/g, 'a')
    .replace(/5/g, 's');
}

export function detectInjection(text: string): boolean {
  const input = normalize(text);

  return (
    INTENT_PATTERNS.some((pattern) => pattern.test(input)) ||
    CONCEPT_PATTERNS.some((pattern) => pattern.test(input))
  );
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
  if (ip.includes(':')) {
    // IPv6 — expand '::' shorthand into explicit zero groups first,
    // so masking always works on a consistent 8-group array.
    // (Naively split(':')-ing a compressed address like '::1' gives
    // ['', '', '1'] instead of 8 groups, which corrupts the masked output.)
    let parts: string[];
    if (ip.includes('::')) {
      const [head, tail] = ip.split('::');
      const headParts = head ? head.split(':') : [];
      const tailParts = tail ? tail.split(':') : [];
      const missing = 8 - headParts.length - tailParts.length;
      parts = [...headParts, ...Array(Math.max(missing, 0)).fill('0'), ...tailParts];
    } else {
      parts = ip.split(':');
    }
    // Mask the full 64-bit interface identifier (last four groups),
    // SLAAC/EUI-64 and privacy-extension addresses can still
    // be device-identifying if any part of the interface ID survives masking.
    // Only the /64 network prefix (first four groups) is retained.
    for (let i = 4; i < 8; i++) {
      parts[i] = 'xxxx';
    }
    return parts.join(':');
  }

  // IPv4
  return ip.replace(/\.\d+$/, '.xxx');
}
