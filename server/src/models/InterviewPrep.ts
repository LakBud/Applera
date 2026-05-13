import mongoose from "mongoose";

const InterviewPrepSchema = new mongoose.Schema(
  {
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: true,
    },

    questions: [
      {
        category: String, // e.g. "Technical", "Behavioural", "Culture fit"
        question: String,
        tip: String, // coaching tip for how to answer
      },
    ],

    general_tips: [String], // overall advice for this specific interview
  },
  { timestamps: true },
);

export default mongoose.model("InterviewPrep", InterviewPrepSchema);
