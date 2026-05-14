import mongoose from "mongoose";

const AuditEventSchema = new mongoose.Schema(
  {
    event: { type: String, required: true },

    userId: { type: String, required: true },
    userType: { type: String, enum: ["user", "guest"], required: true },

    requestId: String,
    resourceId: String,

    ip: String,
    userAgent: String,

    metadata: { type: mongoose.Schema.Types.Mixed },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

export default mongoose.model("AuditEvent", AuditEventSchema);
