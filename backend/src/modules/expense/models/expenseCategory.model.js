import mongoose from "mongoose";

const expenseCategorySchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true, uppercase: true },
    description: { type: String, trim: true, default: "" },
    requiresReceipt: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

expenseCategorySchema.index({ companyId: 1, code: 1 }, { unique: true });
expenseCategorySchema.index({ companyId: 1, isActive: 1 });

const ExpenseCategory = mongoose.model(
  "ExpenseCategory",
  expenseCategorySchema,
);

export default ExpenseCategory;
