export type ConfidenceLevel = "high" | "medium" | "low";

export type MatchReport = {
  score: number;
  strengths: string[];
  missing_skills: string[];
  seniority_fit: "under" | "over" | "match";
  domain_mismatch: boolean;
  confidence: ConfidenceLevel;
  recommendation: string;
  text_overlap: number;
};
