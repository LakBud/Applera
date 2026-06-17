import { MatchReport } from './schemas/match.schemas.js';

export type Application = {
  cv_id: string;
  job_id: string;

  match: MatchReport;

  tailored_cv_summary: string;
  cover_letter: string;

  application_email: {
    subject: string;
    body: string;
  };

  status: 'generated' | 'applied' | 'interviewing' | 'offered' | 'rejected' | 'withdrawn';
};
