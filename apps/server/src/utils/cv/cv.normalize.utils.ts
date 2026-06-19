import type { CVParsed } from '@repo/schemas';

import { normalizeSeniority } from '../shared/seniority.utils.js';

export function normalizeParsedCV(parsedRaw: CVParsed): CVParsed {
  return {
    ...parsedRaw,
    seniority_level: normalizeSeniority(parsedRaw?.seniority_level),
  };
}
