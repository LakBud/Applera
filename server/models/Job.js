import mongoose from "mongoose";

const JobSchema = new mongoose.Schema(
  {
    rawText: String,

    parsed: {
      title: String,
      required_skills: [String],
      responsibilities: [String],
      seniority: String,
    },

    company: String,
    location: String,
  },
  { timestamps: true },
);

export default mongoose.model("Job", JobSchema);
