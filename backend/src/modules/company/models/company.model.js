import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
  {
    /* =========================
       BASIC INFORMATION
    ========================= */

    name: { type: String, required: true, trim: true },
    legalName: { type: String, trim: true },
    registrationNumber: { type: String, trim: true },

    /* =========================
       CONTACT INFORMATION
    ========================= */

    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    website: { type: String, trim: true },

    /* =========================
       ADDRESS
    ========================= */

    address: {
      addressLine1: { type: String, trim: true },
      addressLine2: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      country: { type: String, trim: true, default: "India" },
      postalCode: { type: String, trim: true },
      latitude: { type: Number },
      longitude: { type: Number },
    },

    /* =========================
       COMPANY STATUS
    ========================= */

    status: {
      type: String,
      enum: ["PENDING", "ACTIVE", "SUSPENDED", "INACTIVE"],
      default: "PENDING",
    },

    /* =========================
       COMPANY SETTINGS
    ========================= */

    settings: {
      timezone: { type: String, default: "Asia/Kolkata" },
      currency: { type: String, default: "INR" },
      dateFormat: { type: String, default: "DD-MM-YYYY" },
      attendanceEnabled: { type: Boolean, default: true },
      leaveEnabled: { type: Boolean, default: true },
      gpsAttendanceEnabled: { type: Boolean, default: false },
      attendanceRadius: { type: Number, default: 200 },
    },

    /* =========================
       SUBSCRIPTION
    ========================= */

    subscription: {
      plan: {
        type: String,
        enum: ["STARTER", "GROWTH", "ENTERPRISE"],
        default: "STARTER",
      },
      status: {
        type: String,
        enum: ["TRIAL", "ACTIVE", "PAST_DUE", "CANCELLED", "EXPIRED"],
        default: "TRIAL",
      },
      trialEndsAt: { type: Date },
      startsAt: { type: Date },
      expiresAt: { type: Date },
    },

    /* =========================
       AUDIT
    ========================= */

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  },
);

/* =========================
   INDEXES
========================= */

companySchema.index({ email: 1 });
companySchema.index({ registrationNumber: 1 });
companySchema.index({ status: 1 });

const Company = mongoose.model("Company", companySchema);

export default Company;
