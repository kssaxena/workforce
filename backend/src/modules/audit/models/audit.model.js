import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },

    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    action: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      index: true,
    },

    module: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },

    entityType: {
      type: String,
      required: true,
      trim: true,
    },

    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      index: true,
    },

    targetEmployeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      index: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    before: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    after: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    ipAddress: {
      type: String,
      trim: true,
    },

    userAgent: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

auditLogSchema.index({
  companyId: 1,
  createdAt: -1,
});

auditLogSchema.index({
  companyId: 1,
  module: 1,
  action: 1,
  createdAt: -1,
});

auditLogSchema.index({
  companyId: 1,
  targetEmployeeId: 1,
  createdAt: -1,
});

const AuditLog = mongoose.model("AuditLog", auditLogSchema);

export default AuditLog;
