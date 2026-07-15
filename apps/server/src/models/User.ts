import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },

    email: {
      type: String,
      default: '',
      index: true,
      trim: true,
      lowercase: true,
    },

    firstName: {
      type: String,
      trim: true,
    },

    lastName: {
      type: String,
      trim: true,
    },

    imageUrl: {
      type: String,
      trim: true,
    },

    plan: {
      type: String,
      enum: ['free', 'pro', 'enterprise'],
      default: 'free',
    },

    pinnedCVCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export default mongoose.model('User', UserSchema);
