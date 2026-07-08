import { normalizeSeniority } from '../shared/seniority.utils.js';

import type { MatchReport } from '../../types/schemas/match.schemas.js';
import type { Seniority } from '@applera/schemas';

const SENIORITY_RANK: Record<Seniority, number | undefined> = {
  intern: 0,
  junior: 1,
  mid: 2,
  senior: 3,
  lead: 4,
  executive: 5,
  unknown: undefined,
};

export function getSeniorityFit(
  cvLevel: unknown,
  jobLevel: unknown,
): MatchReport['seniority_fit'] | 'unknown' {
  const cvRank = SENIORITY_RANK[normalizeSeniority(cvLevel)];
  const jobRank = SENIORITY_RANK[normalizeSeniority(jobLevel)];

  // if either side couldn't be classified, don't guess
  if (cvRank === undefined || jobRank === undefined) {
    return 'unknown';
  }

  const diff = cvRank - jobRank;

  if (diff < 0) return 'under';
  if (diff > 0) return 'over';
  return 'match';
}
