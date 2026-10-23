import mongoose from "mongoose";

const { Schema } = mongoose;

const verificationFields = {
  verifiedAt: { type: Date, default: null },
  verifiedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
};

const employeePayrollProfileSchema = new Schema(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },

    employeeId: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },

    stateCode: {
      type: String,
      uppercase: true,
      trim: true,
      required: true,
    },

    pf: {
      membershipStatus: {
        type: String,
        enum: ["NOT_ASSESSED", "COVERED", "EXEMPT", "UNVERIFIED"],
        default: "NOT_ASSESSED",
        required: true,
      },

      // Store encrypted identifiers only. Never store raw UAN here.
      uanCiphertext: { type: String, default: null },
      uanLast4: { type: String, default: null },

      internationalWorker: { type: Boolean, default: null },
      epsEligible: { type: Boolean, default: null },

      contributionWageBasis: {
        type: String,
        enum: ["STATUTORY_CEILING", "ACTUAL_WAGES", null],
        default: null,
      },

      ...verificationFields,
    },

    esi: {
      coverageStatus: {
        type: String,
        enum: ["NOT_ASSESSED", "COVERED", "NOT_COVERED", "UNVERIFIED"],
        default: "NOT_ASSESSED",
        required: true,
      },

      // Store encrypted identifiers only. Never store raw insurance number.
      insuranceNumberCiphertext: { type: String, default: null },
      insuranceNumberLast4: { type: String, default: null },

      coverageEffectiveFrom: { type: Date, default: null },
      coverageEffectiveTo: { type: Date, default: null },

      ...verificationFields,
    },

    professionalTax: {
      status: {
        type: String,
        enum: ["NOT_ASSESSED", "APPLICABLE", "EXEMPT", "UNVERIFIED"],
        default: "NOT_ASSESSED",
        required: true,
      },

      exemptionReason: { type: String, default: null },
      ...verificationFields,
    },

    incomeTax: {
      panCiphertext: { type: String, default: null },
      panLast4: { type: String, default: null },

      taxRegime: {
        type: String,
        enum: ["OLD", "NEW", null],
        default: null,
      },

      taxYear: { type: String, default: null },

      // Store declarations as claims, not as automatically approved deductions.
      declarations: {
        type: [
          {
            code: { type: String, required: true },
            claimedAmountPaise: {
              type: Number,
              required: true,
              min: 0,
              validate: Number.isSafeInteger,
            },
            approvedAmountPaise: {
              type: Number,
              min: 0,
              default: null,
              validate: {
                validator(value) {
                  return value == null || Number.isSafeInteger(value);
                },
                message: "Approved amount must be integer paise",
              },
            },
            verificationStatus: {
              type: String,
              enum: ["PENDING", "VERIFIED", "REJECTED"],
              default: "PENDING",
            },
            verifiedAt: { type: Date, default: null },
            verifiedBy: {
              type: Schema.Types.ObjectId,
              ref: "User",
              default: null,
            },
          },
        ],
        default: [],
      },

      ...verificationFields,
    },

    profileStatus: {
      type: String,
      enum: ["INCOMPLETE", "REVIEW_REQUIRED", "VERIFIED"],
      default: "INCOMPLETE",
      index: true,
    },
  },
  { timestamps: true },
);

employeePayrollProfileSchema.index(
  { companyId: 1, employeeId: 1 },
  { unique: true },
);

export default mongoose.model(
  "EmployeePayrollProfile",
  employeePayrollProfileSchema,
);
