import mongoose from "mongoose";

const InterviewPrepSchema = new mongoose.Schema(
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

    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: true,
      unique: true,
    },

    questions: [
      {
        category: { type: String, trim: true },
        question: { type: String, trim: true },
        tip: { type: String, trim: true },
      },
    ],

    general_tips: [{ type: String, trim: true }],
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export default mongoose.model("InterviewPrep", InterviewPrepSchema);
