import mongoose from 'mongoose';

export const APPLICATION_STATUSES = [
  'generated',
  'applied',
  'interviewing',
  'offered',
  'rejected',
  'withdrawn',
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

const ApplicationSchema = new mongoose.Schema(
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

    cv: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CV',
      required: true,
    },

    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },

    // snapshots
    cvNameSnapshot: String,
    jobTitleSnapshot: String,
    companySnapshot: String,
    locationSnapshot: String,

    match: {
      score: {
        type: Number,
        min: 0,
        max: 100,
      },

      confidence: {
        type: String,
        trim: true,
      },

      strengths: [{ type: String, trim: true }],
      missing_skills: [{ type: String, trim: true }],
    },

    tailored_cv_summary: {
      type: String,
      maxlength: 10000,
    },

    cover_letter: {
      type: String,
      maxlength: 20000,
    },

    application_email: {
      subject: {
        type: String,
        trim: true,
      },
      body: {
        type: String,
        maxlength: 20000,
      },
    },

    status: {
      type: String,
      enum: APPLICATION_STATUSES,
      default: 'generated',
    },

    statusUpdatedAt: {
      type: Date,
      default: Date.now,
    },

    notes: {
      type: String,
      maxlength: 5000,
    },

    deletedAt: Date,
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

ApplicationSchema.index({ ownerId: 1, createdAt: -1 });
ApplicationSchema.index({ cv: 1 });
ApplicationSchema.index({ job: 1 });

export default mongoose.model('Application', ApplicationSchema);
