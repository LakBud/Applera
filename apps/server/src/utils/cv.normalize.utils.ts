export const ALLOWED_SENIORITY = [
  'executive',
  'junior',
  'mid',
  'senior',
  'lead',
  'unknown',
] as const;

type Seniority = (typeof ALLOWED_SENIORITY)[number];

export function normalizeSeniority(value: unknown): Seniority {
  if (typeof value !== 'string') {
    return 'unknown';
  }
  if (ALLOWED_SENIORITY.includes(value as Seniority)) {
    return value as Seniority;
  }
  return 'unknown';
}

export function normalizeParsedCV(parsedRaw: Record<string, unknown>) {
  return {
    ...parsedRaw,
    seniority_level: normalizeSeniority(parsedRaw?.seniority_level),
  };
}
