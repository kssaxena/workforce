import mongoose from "mongoose";

const { Schema } = mongoose;

const payrollPolicySchema = new Schema(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      unique: true,
      index: true,
    },

    prorationBasis: {
      type: String,
      enum: ["CALENDAR_DAYS", "SCHEDULED_WORKING_DAYS"],
      required: true,
    },

    absenceTreatment: {
      type: String,
      enum: ["UNPAID", "REVIEW_REQUIRED"],
      required: true,
    },

    halfDayFactor: {
      type: Number,
      enum: [0.5, 1],
      required: true,
    },

    paidHolidayTreatment: {
      type: String,
      enum: ["PAID", "REVIEW_REQUIRED"],
      required: true,
    },

    paidWeeklyOffTreatment: {
      type: String,
      enum: ["PAID", "REVIEW_REQUIRED"],
      required: true,
    },

    unpaidLeaveTreatment: {
      type: String,
      enum: ["DEDUCT", "REVIEW_REQUIRED"],
      required: true,
    },

    overtime: {
      enabled: { type: Boolean, required: true },
      requiresApproval: { type: Boolean, default: true },
      rateMultiplier: {
        type: Number,
        min: 1,
        max: 5,
        default: null,
      },
      calculationBasis: {
        type: String,
        enum: ["HOURLY_RATE", "FIXED_AMOUNT", null],
        default: null,
      },
      fixedAmountPaisePerHour: {
        type: Number,
        min: 0,
        default: null,
      },
    },

    effectiveFrom: { type: Date, required: true },
    effectiveTo: { type: Date, default: null },

    status: {
      type: String,
      enum: ["DRAFT", "ACTIVE", "SUPERSEDED"],
      default: "DRAFT",
      index: true,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

payrollPolicySchema.index({
  companyId: 1,
  status: 1,
  effectiveFrom: -1,
});

export default mongoose.model("PayrollPolicy", payrollPolicySchema);
