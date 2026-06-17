import mongoose from 'mongoose';

export const AUDIT_EVENTS = [
  'AUTH_LOGIN',
  'AUTH_LOGOUT',
  'GUEST_SESSION_CREATED',

  'CV_CREATED',
  'CV_UPLOADED',
  'CV_DELETED',

  'JOB_CREATED',
  'JOB_ANALYZED',

  'APPLICATION_CREATED',
  'APPLICATION_UPDATED',
  'APPLICATION_DELETED',

  'INTERVIEW_PREP_CREATED',

  'AI_REQUEST',
  'AI_RESPONSE',

  'SYSTEM_ERROR',
  'SECURITY_ALERT',
] as const;

export type AuditEventType = (typeof AUDIT_EVENTS)[number];

const AuditEventSchema = new mongoose.Schema(
  {
    event: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    userId: {
      type: String,
      required: true,
      index: true,
    },

    userType: {
      type: String,
      enum: ['user', 'guest'],
      required: true,
    },

    requestId: String,
    resourceId: String,

    ip: String,
    userAgent: String,

    metadata: mongoose.Schema.Types.Mixed,
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Performance indexes (important for debugging dashboards)
AuditEventSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 }); // 90 days
AuditEventSchema.index({ userId: 1, createdAt: -1 });
AuditEventSchema.index({ requestId: 1 });
AuditEventSchema.index({ event: 1, createdAt: -1 });

export default mongoose.model('AuditEvent', AuditEventSchema);
