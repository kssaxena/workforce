import mongoose from "mongoose";

const { Schema } = mongoose;

const moneySchema = new Schema(
  {
    code: { type: String, required: true },
    label: { type: String, required: true },
    amountPaise: { type: Number, required: true, min: 0 },
    category: {
      type: String,
      enum: ["EARNING", "DEDUCTION", "EMPLOYER_CONTRIBUTION"],
      required: true,
    },
    source: { type: String, required: true },
  },
  { _id: false },
);

const employeePayrollSnapshotSchema = new Schema(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    employeeCode: { type: String, required: true },
    employeeName: { type: String, required: true },

    salaryStructureId: {
      type: Schema.Types.ObjectId,
      ref: "SalaryStructure",
      required: true,
    },
    salaryStructureUpdatedAt: { type: Date, required: true },

    joiningDate: { type: Date, required: true },
    exitDate: { type: Date, default: null },

    periodCalendarDays: { type: Number, required: true, min: 1 },
    eligibleCalendarDays: { type: Number, required: true, min: 0 },
    scheduledWorkingDays: { type: Number, required: true, min: 0 },
    paidDays: { type: Number, required: true, min: 0 },
    unpaidDays: { type: Number, required: true, min: 0 },

    earnings: { type: [moneySchema], default: [] },
    deductions: { type: [moneySchema], default: [] },
    employerContributions: { type: [moneySchema], default: [] },

    grossEarningsPaise: { type: Number, required: true, min: 0 },
    totalDeductionsPaise: { type: Number, required: true, min: 0 },
    employerContributionsPaise: { type: Number, required: true, min: 0 },
    netPayablePaise: { type: Number, required: true, min: 0 },

    calculationVersion: { type: String, required: true },
    inputFingerprint: { type: String, required: true },

    validationIssues: {
      type: [
        {
          code: { type: String, required: true },
          message: { type: String, required: true },
          blocking: { type: Boolean, default: true },
        },
      ],
      default: [],
    },

    statutory: {
      type: {
        EPF: {
          status: {
            type: String,
            enum: ["CALCULATED", "NOT_APPLICABLE", "BLOCKED"],
            required: true,
          },
          wageBasePaise: { type: Number, min: 0, default: 0 },
          employeeContributionPaise: { type: Number, min: 0, default: 0 },
          employerContributionPaise: { type: Number, min: 0, default: 0 },
          epsContributionPaise: { type: Number, min: 0, default: 0 },
          employerEpfContributionPaise: { type: Number, min: 0, default: 0 },
          ruleSetVersion: { type: String, default: null },
        },
        ESI: {
          status: {
            type: String,
            enum: ["CALCULATED", "NOT_APPLICABLE", "BLOCKED"],
            required: true,
          },
          wageBasePaise: { type: Number, min: 0, default: 0 },
          employeeContributionPaise: { type: Number, min: 0, default: 0 },
          employerContributionPaise: { type: Number, min: 0, default: 0 },
          ruleSetVersion: { type: String, default: null },
        },
        PROFESSIONAL_TAX: {
          status: {
            type: String,
            enum: ["CALCULATED", "NOT_APPLICABLE", "BLOCKED"],
            required: true,
          },
          amountPaise: { type: Number, min: 0, default: 0 },
          ruleSetVersion: { type: String, default: null },
        },
        TDS: {
          status: {
            type: String,
            enum: ["CALCULATED", "NOT_APPLICABLE", "BLOCKED"],
            required: true,
          },
          annualTaxLiabilityPaise: { type: Number, min: 0, default: 0 },
          taxAlreadyDeductedPaise: { type: Number, min: 0, default: 0 },
          remainingTaxPaise: { type: Number, min: 0, default: 0 },
          suggestedMonthlyTdsPaise: { type: Number, min: 0, default: 0 },
          taxYear: { type: String, default: null },
          taxRegime: {
            type: String,
            enum: ["OLD", "NEW", null],
            default: null,
          },
          ruleSetVersion: { type: String, default: null },
        },
      },
      default: undefined,
    },

    statutoryRuleSetVersions: {
      type: {
        EPF: { type: String, default: null },
        ESI: { type: String, default: null },
        PROFESSIONAL_TAX: { type: String, default: null },
        TDS: { type: String, default: null },
      },
      default: undefined,
    },
  },
  { _id: false },
);

const payrollRunSchema = new Schema(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },

    periodStart: { type: Date, required: true },
    periodEnd: { type: Date, required: true },

    status: {
      type: String,
      enum: ["DRAFT", "REVIEW", "FINALIZED", "VOID"],
      default: "DRAFT",
      index: true,
    },

    employees: {
      type: [employeePayrollSnapshotSchema],
      default: [],
    },

    totals: {
      employeeCount: { type: Number, default: 0 },
      grossEarningsPaise: { type: Number, default: 0 },
      employeeDeductionsPaise: { type: Number, default: 0 },
      employerContributionsPaise: { type: Number, default: 0 },
      netPayablePaise: { type: Number, default: 0 },
    },

    complianceSnapshot: {
      rulesetVersion: { type: String, default: null },
      profileUpdatedAt: { type: Date, default: null },
      verifiedAt: { type: Date, default: null },
      stateCode: { type: String, default: null },
    },

    generatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    reviewedAt: { type: Date, default: null },

    finalizedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    finalizedAt: { type: Date, default: null },

    calculationVersion: {
      type: String,
      default: "payroll-v1",
      required: true,
    },
  },
  { timestamps: true },
);

payrollRunSchema.index(
  { companyId: 1, periodStart: 1, periodEnd: 1 },
  { unique: true },
);

payrollRunSchema.index({ companyId: 1, status: 1, periodStart: -1 });

export default mongoose.model("PayrollRun", payrollRunSchema);
