import mongoose from "mongoose";

const InterviewPrepSchema = new mongoose.Schema(
  {
    ownerId: {
      type: String,
      required: true,
      index: true,
    },

    ownerType: {
      type: String,
      required: true,
      enum: ["user", "guest"],
      index: true,
    },

    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: true,
    },

    questions: [
      {
        category: String,
        question: String,
        tip: String,
      },
    ],

    general_tips: [String],
  },
  { timestamps: true },
);

export default mongoose.model("InterviewPrep", InterviewPrepSchema);
