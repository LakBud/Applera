export const ALLOWED_SENIORITY = ["executive", "junior", "mid", "senior", "lead", "unknown"] as const;

export function normalizeSeniority(value: unknown): (typeof ALLOWED_SENIORITY)[number] {
  if (typeof value !== "string") return "unknown";
  if (ALLOWED_SENIORITY.includes(value as any)) return value as any;
  return "unknown";
}

export function normalizeParsedCV(parsedRaw: any) {
  return {
    ...parsedRaw,
    seniority_level: normalizeSeniority(parsedRaw?.seniority_level),
  };
}
