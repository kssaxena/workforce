import mongoose from "mongoose";

const { Schema, model, models } = mongoose;

const payrollTaxLedgerSchema = new Schema(
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
    },

    payrollRunId: {
      type: Schema.Types.ObjectId,
      ref: "PayrollRun",
      required: true,
    },

    // Determined from the actual salary payment date.
    taxYear: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}$/,
    },

    paymentDate: {
      type: Date,
      required: true,
    },

    entryType: {
      type: String,
      enum: ["WITHHOLDING", "REVERSAL", "ADJUSTMENT"],
      required: true,
    },

    // Always stored as positive integer paise.
    // Reversals and reductions are interpreted by entryType/direction.
    taxableSalaryPaise: {
      type: Number,
      required: true,
      min: 0,
      validate: Number.isSafeInteger,
    },

    tdsDeductedPaise: {
      type: Number,
      required: true,
      min: 0,
      validate: Number.isSafeInteger,
    },

    adjustmentDirection: {
      type: String,
      enum: ["ADD", "REDUCE", null],
      default: null,
    },

    reversesEntryId: {
      type: Schema.Types.ObjectId,
      ref: "PayrollTaxLedger",
      default: null,
    },

    // A stable key makes retries idempotent.
    idempotencyKey: {
      type: String,
      required: true,
      trim: true,
    },

    recordedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    strict: "throw",
  },
);

payrollTaxLedgerSchema.index({
  companyId: 1,
  employeeId: 1,
  taxYear: 1,
  paymentDate: 1,
});

payrollTaxLedgerSchema.index(
  { companyId: 1, idempotencyKey: 1 },
  { unique: true },
);

payrollTaxLedgerSchema.index({
  companyId: 1,
  employeeId: 1,
  payrollRunId: 1,
});

payrollTaxLedgerSchema.pre("validate", function () {
  if (this.entryType === "REVERSAL" && !this.reversesEntryId) {
    this.invalidate(
      "reversesEntryId",
      "A reversal must reference the original ledger entry",
    );
  }

  if (this.entryType === "ADJUSTMENT" && !this.adjustmentDirection) {
    this.invalidate(
      "adjustmentDirection",
      "An adjustment must specify ADD or REDUCE",
    );
  }

  if (this.entryType !== "ADJUSTMENT" && this.adjustmentDirection) {
    this.invalidate(
      "adjustmentDirection",
      "Only adjustment entries can specify an adjustment direction",
    );
  }
});

const PayrollTaxLedger =
  models.PayrollTaxLedger || model("PayrollTaxLedger", payrollTaxLedgerSchema);

export default PayrollTaxLedger;
