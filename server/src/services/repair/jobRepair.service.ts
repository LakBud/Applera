import { JobSchemaData } from '../../types/schemas/schema.js';
import { dedupe, normalizeArray, normalizeString } from '../../utils/repair.utils.js';

type Seniority = 'executive' | 'intern' | 'junior' | 'mid' | 'senior' | 'lead' | 'unknown';

function normalizeSeniority(input: unknown): Seniority {
  const v = normalizeString(String(input)).toLowerCase();

  if (v.includes('intern')) return 'intern';
  if (v.includes('junior')) return 'junior';
  if (v.includes('mid')) return 'mid';
  if (v.includes('senior') && !v.includes('lead')) return 'senior';
  if (v.includes('lead')) return 'lead';
  if (v.includes('executive') || v.includes('c-level')) return 'executive';

  return 'unknown';
}

function requireString(value: unknown, fallback = ''): string {
  if (typeof value === 'string' && value.trim().length > 0) {
    return value.trim();
  }
  return fallback;
}

export function repairJob(job: unknown, rawText?: string): JobSchemaData {
  if (!job || typeof job !== 'object') {
    throw new TypeError('[jobRepair] Job must be a valid object');
  }

  const data = job as any;

  return {
    title: requireString(data.title),
    company: requireString(data.company),
    location: requireString(data.location),
    required_skills: dedupe(normalizeArray(data.required_skills)),
    responsibilities: dedupe(normalizeArray(data.responsibilities)),
    seniority: normalizeSeniority(data.seniority),
    raw_description: requireString(data.raw_description) || rawText || '',
  };
}
