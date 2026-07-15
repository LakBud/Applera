import mongoose from 'mongoose';

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
      enum: ['user', 'guest'],
      required: true,
      index: true,
    },

    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
      unique: true,
    },

    parsed: {
      questions: [
        {
          category: { type: String, trim: true, required: true },
          question: { type: String, trim: true, required: true },
          tip: { type: String, trim: true, required: true },
        },
      ],

      general_tips: [
        {
          type: String,
          trim: true,
        },
      ],
    },

    regenerationCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export default mongoose.model('InterviewPrep', InterviewPrepSchema);
