export type MatchData = {
  score: number;

  confidence: "low" | "medium" | "high";

  strengths: string[];

  missing_skills: string[];

  // optional but useful for debugging / future features
  matched_keywords?: string[];

  explanation?: string;
};
