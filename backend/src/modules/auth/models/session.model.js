import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
    refreshTokenHash: { type: String, required: true },
    deviceInfo: { type: String, trim: true },
    ipAddress: { type: String, trim: true },
    userAgent: { type: String, trim: true },
    expiresAt: { type: Date, required: true },
    revokedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  },
);

sessionSchema.index({ expiresAt: 1 });
sessionSchema.index({ userId: 1, revokedAt: 1 });

const Session = mongoose.model("Session", sessionSchema);

export default Session;
