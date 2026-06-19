export const ALLOWED_SENIORITY = [
  'executive',
  'intern',
  'junior',
  'mid',
  'senior',
  'lead',
  'unknown',
] as const;

export type Seniority = (typeof ALLOWED_SENIORITY)[number];
