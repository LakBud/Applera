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

export const SENIORITY_FIT_VALUES = ['under', 'over', 'match', 'unknown'] as const;
