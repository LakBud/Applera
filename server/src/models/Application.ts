import mongoose from "mongoose";

export const APPLICATION_STATUSES = [
  "generated", // just created
  "applied", // sent to employer
  "interviewing", // interview scheduled or ongoing
  "offered", // received an offer
  "rejected", // rejected
  "withdrawn", // candidate withdrew
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

const ApplicationSchema = new mongoose.Schema(
  {
    cv: { type: mongoose.Schema.Types.ObjectId, ref: "CV" },
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Job" },

    match: {
      score: Number,
      confidence: String,
      strengths: [String],
      missing_skills: [String],
    },

    tailored_cv_summary: String,
    cover_letter: String,

    application_email: {
      subject: String,
      body: String,
    },

    // ── Tracker field ─────────────────────────────────────────────
    status: {
      type: String,
      enum: APPLICATION_STATUSES,
      default: "generated",
    },

    notes: String, // free-text notes the user can add per application
  },
  { timestamps: true },
);

export default mongoose.model("Application", ApplicationSchema);
