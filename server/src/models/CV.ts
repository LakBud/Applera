import mongoose from "mongoose";
import { boolean } from "zod";

const CVSchema = new mongoose.Schema(
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

    lastUsedAt: Date,

    rawText: {
      type: String,
      maxlength: 100000,
    },

    parsed: {
      name: { type: String, trim: true },
      email: { type: String, trim: true, lowercase: true },
      phone: { type: String, trim: true },
      github: { type: String, trim: true },

      summary: {
        type: String,
        trim: true,
        maxlength: 5000,
      },

      seniority_level: {
        type: String,
        enum: ["executive", "junior", "mid", "senior", "lead", "unknown"],
        default: "unknown",
      },

      skills: [{ type: String, trim: true }],

      experience: [
        {
          title: { type: String, trim: true },
          company: { type: String, trim: true },
          highlights: [{ type: String, trim: true }],
        },
      ],

      education: [
        {
          title: { type: String, trim: true },
          school: { type: String, trim: true },
        },
      ],

      projects: [
        {
          name: { type: String, trim: true },
          description: { type: String, trim: true },
          url: { type: String, trim: true },
          tech: [{ type: String, trim: true }],
        },
      ],
    },

    pdfUrl: { type: String },
    previewImageUrl: { type: String },
    pinned: { type: Boolean, default: false },

    contentHash: {
      type: String,
      index: true,
      required: true,
      unique: false,
    },

    deletedAt: Date,
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

CVSchema.index({ ownerId: 1, createdAt: -1 });
CVSchema.index({ ownerId: 1, pinned: -1, lastUsedAt: -1 });

export default mongoose.model("CV", CVSchema);
