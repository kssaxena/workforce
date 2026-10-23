import mongoose from "mongoose";

const { Schema } = mongoose;

const statutoryRuleSetSchema = new Schema(
  {
    ruleType: {
      type: String,
      enum: ["EPF", "ESI", "PROFESSIONAL_TAX", "TDS"],
      required: true,
      index: true,
    },

    // Examples: IN for central rules, IN-MH for Maharashtra.
    jurisdictionCode: {
      type: String,
      uppercase: true,
      trim: true,
      required: true,
      index: true,
    },

    version: {
      type: String,
      required: true,
      trim: true,
    },

    effectiveFrom: {
      type: Date,
      required: true,
      index: true,
    },

    effectiveTo: {
      type: Date,
      default: null,
    },

    // Validated by the calculation service before use.
    parameters: {
      type: Schema.Types.Mixed,
      required: true,
    },

    sources: {
      type: [
        {
          title: { type: String, required: true },
          url: { type: String, required: true },
          publishedAt: { type: Date, default: null },
          retrievedAt: { type: Date, required: true },
          notes: { type: String, default: "" },
        },
      ],
      required: true,
      validate: {
        validator(sources) {
          return Array.isArray(sources) && sources.length > 0;
        },
        message: "At least one authoritative source is required",
      },
    },

    status: {
      type: String,
      enum: ["DRAFT", "VERIFIED", "RETIRED"],
      default: "DRAFT",
      index: true,
    },

    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    verifiedAt: {
      type: Date,
      default: null,
    },

    verificationNotes: {
      type: String,
      default: "",
      maxlength: 5000,
    },
  },
  { timestamps: true },
);

statutoryRuleSetSchema.index(
  { ruleType: 1, jurisdictionCode: 1, version: 1 },
  { unique: true },
);

statutoryRuleSetSchema.index({
  ruleType: 1,
  jurisdictionCode: 1,
  status: 1,
  effectiveFrom: -1,
});

statutoryRuleSetSchema.pre("validate", function (next) {
  if (this.effectiveTo && this.effectiveTo < this.effectiveFrom) {
    this.invalidate(
      "effectiveTo",
      "Rule end date cannot be earlier than its start date",
    );
  }

  if (this.status === "VERIFIED" && (!this.verifiedBy || !this.verifiedAt)) {
    this.invalidate(
      "verifiedBy",
      "Verified rulesets require a verifier and verification timestamp",
    );
  }

  next();
});

export default mongoose.model("StatutoryRuleSet", statutoryRuleSetSchema);
