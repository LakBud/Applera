import mongoose from "mongoose";

const JobSchema = new mongoose.Schema(
  {
    ownerId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },

    ownerType: {
      type: String,
      enum: ["user", "guest"],
      required: true,
      index: true,
    },

    rawText: {
      type: String,
      maxlength: 100000,
    },

    parsed: {
      title: {
        type: String,
        trim: true,
      },
      company: { type: String, trim: true },
      location: { type: String, trim: true },

      required_skills: [{ type: String, trim: true }],
      responsibilities: [{ type: String, trim: true }],

      seniority: {
        type: String,
        enum: ["executive", "intern", "junior", "mid", "senior", "lead", "unknown"],
        default: "unknown",
      },
      raw_description: { type: String, maxlength: 100000 },
    },

    company: {
      type: String,
      trim: true,
    },

    location: {
      type: String,
      trim: true,
    },

    deletedAt: Date,
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

JobSchema.index({ ownerId: 1, createdAt: -1 });

export default mongoose.model("Job", JobSchema);
