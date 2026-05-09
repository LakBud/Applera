import mongoose from "mongoose";

const ApplicationSchema = new mongoose.Schema(
  {
    cv: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CV",
    },

    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
    },

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
  },
  { timestamps: true },
);

export default mongoose.model("Application", ApplicationSchema);
