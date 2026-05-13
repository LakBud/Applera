import mongoose from "mongoose";

const CVSchema = new mongoose.Schema(
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
