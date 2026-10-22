import mongoose from "mongoose";

const subscriptionChangeRequestSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },

    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    currentPlan: {
      type: String,
      required: true,
      uppercase: true,
    },

    requestedPlan: {
      type: String,
      required: true,
      enum: ["BEGINNER", "INTERMEDIATE", "PRO"],
    },

    billingCycle: {
      type: String,
      required: true,
      enum: ["MONTHLY", "ANNUAL"],
    },

    currency: {
      type: String,
      default: "INR",
      enum: ["INR"],
    },

    employeeCountAtRequest: {
      type: Number,
      required: true,
      min: 0,
    },

    employeeLimit: {
      type: Number,
      required: true,
      min: 1,
    },

    pricePerEmployee: {
      type: Number,
      required: true,
      min: 0,
    },

    estimatedTotal: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: [
        "PENDING_PAYMENT",
        "PAYMENT_VERIFICATION",
        "APPROVED",
        "REJECTED",
        "CANCELLED",
        "EXPIRED",
      ],
      default: "PENDING_PAYMENT",
      index: true,
    },

    paymentProvider: {
      type: String,
      default: null,
    },

    paymentReference: {
      type: String,
      default: null,
    },

    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    processedAt: {
      type: Date,
      default: null,
    },

    rejectionReason: {
      type: String,
      trim: true,
      maxlength: 500,
      default: null,
    },
  },
  { timestamps: true },
);

// A company can have only one unresolved plan-change request at a time.
subscriptionChangeRequestSchema.index(
  { companyId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: {
        $in: ["PENDING_PAYMENT", "PAYMENT_VERIFICATION"],
      },
    },
  },
);

subscriptionChangeRequestSchema.index({
  companyId: 1,
  createdAt: -1,
});

const SubscriptionChangeRequest = mongoose.model(
  "SubscriptionChangeRequest",
  subscriptionChangeRequestSchema,
);

export default SubscriptionChangeRequest;
