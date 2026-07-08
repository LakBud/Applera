import { normalizeSeniority } from '../shared/seniority.utils.js';

import type { CVParsed } from '@applera/schemas';

export function normalizeParsedCV(parsedRaw: CVParsed): CVParsed {
  return {
    ...parsedRaw,
    seniority_level: normalizeSeniority(parsedRaw?.seniority_level),
  };
}
