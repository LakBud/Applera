import { JobSchemaData } from '../../types/schemas/schema.js';
import { dedupe, normalizeArray, normalizeString } from '../../utils/shared/repair.utils.js';
import { normalizeSeniority } from '../../utils/shared/seniority.utils.js';

export function repairJob(job: unknown, rawText?: string): JobSchemaData {
  if (!job || typeof job !== 'object') {
    throw new TypeError('[jobRepair] Job must be a valid object');
  }

  const data = job as JobSchemaData;

  return {
    title: normalizeString(data.title),
    company: normalizeString(data.company),
    location: normalizeString(data.location),
    required_skills: dedupe(normalizeArray(data.required_skills)),
    responsibilities: dedupe(normalizeArray(data.responsibilities)),
    seniority: normalizeSeniority(data.seniority),
    raw_description: normalizeString(data.raw_description) || rawText || '',
  };
}
