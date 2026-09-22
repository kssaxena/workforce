import mongoose from "mongoose";

const attendancePolicySchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      unique: true,
      index: true,
    },

    /* ================= WORKING HOURS ================= */

    workingHours: { type: Number, required: true, min: 0, default: 8 },
    workingMinutes: { type: Number, required: true, min: 0, default: 480 },

    /* ================= GRACE PERIOD ================= */

    lateArrivalGraceMinutes: { type: Number, min: 0, default: 15 },
    earlyDepartureGraceMinutes: { type: Number, min: 0, default: 15 },

    /* ================= OVERTIME ================= */

    overtimeEnabled: { type: Boolean, default: false },
    minimumOvertimeMinutes: { type: Number, min: 0, default: 30 },

    /* ================= HALF DAY ================= */

    halfDayEnabled: { type: Boolean, default: true },
    halfDayAfterMinutes: { type: Number, min: 0, default: 240 },

    /* ================= ATTENDANCE RULES ================= */

    allowLateCheckIn: { type: Boolean, default: true },
    allowEarlyCheckout: { type: Boolean, default: true },
    requireCheckOut: { type: Boolean, default: true },

    /* ================= BREAK ================= */

    breakEnabled: { type: Boolean, default: false },
    breakMinutes: { type: Number, min: 0, default: 60 },

    /* ================= STATUS ================= */

    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  },
);

export const AttendancePolicy = mongoose.model(
  "AttendancePolicy",
  attendancePolicySchema,
);
