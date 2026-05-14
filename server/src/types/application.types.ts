import type { MatchReport } from "./match.types.js";

export type ApplicationLLMOutput = {
  cv_summary: string;

  application_letter: {
    introduction: string;
    body: string;
    closing: string;
  };

  email_template: {
    subject: string;
    body: string;
  };
};

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

  status: "generated" | "applied" | "interviewing" | "offered" | "rejected" | "withdrawn";
};
