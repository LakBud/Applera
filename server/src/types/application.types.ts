export type MatchData = {
  score: number;

  confidence: "low" | "medium" | "high";

  strengths: string[];

  missing_skills: string[];

  // optional but useful for debugging / future features
  matched_keywords?: string[];

  explanation?: string;
};

export type ApplicationLLMOutput = {
  cv_summary: string;
  application_letter: {
    introduction?: string;
    body?: string;
    closing?: string;
  };
  email_template: {
    subject: string;
    body: string;
  };
};

export type Application = {
  cv: string;
  job: string;

  match: {
    score: number;
    confidence: string;
    strengths: string[];
    missing_skills: string[];
  };

  tailored_cv_summary: string;
  cover_letter: string;

  application_email: {
    subject: string;
    body: string;
  };
};

export type ApplicationCreateInput = {
  cv: any;
  job: any;
  match: any;

  tailored_cv_summary: string;
  cover_letter: string;

  application_email: {
    subject: string;
    body: string;
  };
};
