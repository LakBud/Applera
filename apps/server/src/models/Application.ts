import { APPLICATION_STATUSES, CONFIDENCE_LEVELS, SENIORITY_FIT_VALUES } from '@applera/schemas';
import mongoose from 'mongoose';

import { serializeTimestamps } from '../utils/shared/serializeTimestamps.utils.js';

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
        enum: CONFIDENCE_LEVELS,
        trim: true,
      },

      strengths: [{ type: String, trim: true }],
      missing_skills: [{ type: String, trim: true }],

      seniority_fit: {
        type: String,
        enum: SENIORITY_FIT_VALUES,
        default: 'unknown',
      },

      domain_mismatch: {
        type: Boolean,
        default: false,
      },

      recommendation: {
        type: String,
        trim: true,
        default: '',
      },
    },

    tailoring_advice: {
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

    deletedAt: Date,
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: serializeTimestamps(['createdAt', 'updatedAt', 'statusUpdatedAt', 'deletedAt']),
    },
  },
);

ApplicationSchema.index({ ownerId: 1, createdAt: -1 });
ApplicationSchema.index({ cv: 1 });
ApplicationSchema.index({ job: 1 });

export type ApplicationType = mongoose.InferSchemaType<typeof ApplicationSchema>;

export default mongoose.model('Application', ApplicationSchema);
