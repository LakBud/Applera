export type ConfidenceLevel = 'low' | 'medium' | 'high';

export type MatchReport = {
  score: number;
  strengths: string[];
  missing_skills: string[];
  seniority_fit: 'under' | 'over' | 'match';
  domain_mismatch: boolean;
  confidence: ConfidenceLevel;
  text_overlap: number;

  recommendation: string;
};
