import mongoose from "mongoose";

const { Schema } = mongoose;

const salaryComponentSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      maxlength: 40,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    type: {
      type: String,
      enum: ["EARNING", "DEDUCTION"],
      required: true,
    },
    amountPaise: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: Number.isSafeInteger,
        message: "Component amount must be an integer number of paise",
      },
    },
    taxable: { type: Boolean, required: true },
    affectsPfWages: { type: Boolean, default: false },
    affectsEsiWages: { type: Boolean, default: false },
    isRecurring: { type: Boolean, default: true },
  },
  { _id: false },
);

const salaryStructureSchema = new Schema(
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
    currency: {
      type: String,
      enum: ["INR"],
      default: "INR",
      required: true,
    },
    payFrequency: {
      type: String,
      enum: ["MONTHLY"],
      default: "MONTHLY",
      required: true,
    },
    components: {
      type: [salaryComponentSchema],
      required: true,
      validate: {
        validator(components) {
          if (!Array.isArray(components) || components.length === 0) {
            return false;
          }

          const codes = components.map((item) => item.code);
          return new Set(codes).size === codes.length;
        },
        message: "Salary components must be non-empty with unique codes",
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

salaryStructureSchema.index({
  companyId: 1,
  employeeId: 1,
  effectiveFrom: 1,
});

salaryStructureSchema.index({
  companyId: 1,
  employeeId: 1,
  status: 1,
  effectiveFrom: -1,
});

export default mongoose.model("SalaryStructure", salaryStructureSchema);
