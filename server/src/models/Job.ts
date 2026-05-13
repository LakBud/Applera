import mongoose from "mongoose";

const JobSchema = new mongoose.Schema(
  {
    ownerId: {
      type: String,
      required: true,
      index: true,
    },

    ownerType: {
      type: String,
      enum: ["user", "guest"],
      required: true,
      index: true,
    },
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
