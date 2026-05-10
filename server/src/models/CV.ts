import mongoose from "mongoose";

const CVSchema = new mongoose.Schema(
  {
    rawText: String,

    parsed: {
      name: String,
      email: String,
      phone: String,
      github: String,
      summary: String,
      seniority_level: String,
      skills: [String],
      experience: [
        {
          title: String,
          company: String,
          highlights: [String],
        },
      ],
      education: [
        {
          title: String,
          school: String,
        },
      ],
    },
  },
  { timestamps: true },
);

export default mongoose.model("CV", CVSchema);
