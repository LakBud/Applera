import { CVSchemaData } from '../../types/schemas/schema.js';
import { normalizeSeniority } from '../shared/seniority.utils.js';

export function normalizeParsedCV(parsedRaw: CVSchemaData): CVSchemaData {
  return {
    ...parsedRaw,
    seniority_level: normalizeSeniority(parsedRaw?.seniority_level),
  };
}
