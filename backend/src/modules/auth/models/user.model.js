import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    /* =========================
       IDENTITY
    ========================= */

    email: { type: String, lowercase: true, trim: true, sparse: true },
    phone: { type: String, trim: true, sparse: true },
    password: { type: String, select: false },

    /* =========================
       USER STATUS
    ========================= */

    status: {
      type: String,
      enum: ["PENDING", "ACTIVE", "SUSPENDED", "INACTIVE"],
      default: "PENDING",
    },
    emailVerified: { type: Boolean, default: false },
    phoneVerified: { type: Boolean, default: false },

    /* =========================
       LOGIN INFORMATION
    ========================= */

    lastLoginAt: { type: Date },
  },
  {
    timestamps: true,
  },
);

userSchema.index({ email: 1 });

userSchema.index({ phone: 1 });

const User = mongoose.model("User", userSchema);

export default User;
