import { Types } from "mongoose";
import { CVData, JobData } from "./types.js";
import { MatchData } from "./application.types.js";

// ─────────────────────────────────────────────
// CV + Job documents (stored in DB after parsing)
// ─────────────────────────────────────────────

export type CVDocument = {
  _id: Types.ObjectId;
  parsed: CVData;
};

export type JobDocument = {
  _id: Types.ObjectId;
  parsed: JobData;
};

// ─────────────────────────────────────────────
// Application document (Mongoose model shape)
// ─────────────────────────────────────────────

export type ApplicationDocument = {
  _id: Types.ObjectId;

  cv: Types.ObjectId | CVDocument;
  job: Types.ObjectId | JobDocument;

  match?: MatchData;

  tailored_cv_summary?: string;
  cover_letter?: string;

  application_email?: {
    subject: string;
    body: string;
  };

  status: "generated" | "applied" | "interviewing" | "offered" | "rejected" | "withdrawn";

  notes?: string;

  createdAt: Date;
  updatedAt: Date;
};
