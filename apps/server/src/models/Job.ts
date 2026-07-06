import { ALLOWED_SENIORITY } from '@repo/schemas';
import mongoose from 'mongoose';

const JobSchema = new mongoose.Schema(
  {
    ownerId: { type: String, required: true, index: true, trim: true },
    ownerType: { type: String, enum: ['user', 'guest'], required: true, index: true },
    rawText: { type: String, maxlength: 100000 },
    parsed: {
      title: { type: String, trim: true },
      company: { type: String, trim: true },
      location: { type: String, trim: true },
      required_skills: [{ type: String, trim: true }],
      responsibilities: [{ type: String, trim: true }],
      seniority: {
        type: String,
        enum: ALLOWED_SENIORITY,
        default: 'unknown',
      },
      raw_description: { type: String, maxlength: 100000 },
    },
    deletedAt: Date,
  },
  { timestamps: true, versionKey: false },
);

JobSchema.index({ ownerId: 1, createdAt: -1 });

export default mongoose.model('Job', JobSchema);
