import { z } from 'zod';

import { MatchReportSchema } from './schemas/match.schemas.js';

export type ConfidenceLevel = z.infer<typeof MatchReportSchema>['confidence'];
export type MatchReport = z.infer<typeof MatchReportSchema>;
