import mongoose from "mongoose";

const { Schema } = mongoose;

const payrollComplianceProfileSchema = new Schema(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      unique: true,
      index: true,
    },

    country: {
      type: String,
      enum: ["IN"],
      default: "IN",
      required: true,
    },

    stateCode: {
      type: String,
      uppercase: true,
      trim: true,
      required: true,
    },

    establishmentType: {
      type: String,
      enum: ["COMPANY", "PARTNERSHIP", "PROPRIETORSHIP", "LLP", "OTHER"],
      required: true,
    },

    financialYearStartMonth: {
      type: Number,
      min: 1,
      max: 12,
      default: 4,
      required: true,
    },

    pf: {
      applicable: { type: Boolean, default: null },
      establishmentCode: { type: String, trim: true, default: null },
      verifiedAt: { type: Date, default: null },
      verifiedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    },

    esi: {
      applicable: { type: Boolean, default: null },
      establishmentCode: { type: String, trim: true, default: null },
      verifiedAt: { type: Date, default: null },
      verifiedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    },

    professionalTax: {
      applicable: { type: Boolean, default: null },
      registrationNumber: { type: String, trim: true, default: null },
      verifiedAt: { type: Date, default: null },
      verifiedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    },

    incomeTax: {
      enabled: { type: Boolean, default: true },
      defaultTaxRegime: {
        type: String,
        enum: ["OLD", "NEW", null],
        default: null,
      },
      financialYear: { type: String, default: null },
      rulesetVersion: { type: String, default: null },
      verifiedAt: { type: Date, default: null },
      verifiedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    },

    complianceRulesetVersion: {
      type: String,
      default: null,
    },

    complianceReviewedAt: {
      type: Date,
      default: null,
    },

    complianceReviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    status: {
      type: String,
      enum: ["INCOMPLETE", "REVIEW_REQUIRED", "VERIFIED"],
      default: "INCOMPLETE",
      index: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model(
  "PayrollComplianceProfile",
  payrollComplianceProfileSchema,
);
