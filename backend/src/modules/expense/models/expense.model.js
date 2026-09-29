import mongoose from "mongoose";

const receiptSchema = new mongoose.Schema(
  {
    url: { type: String, required: true, trim: true },
    fileName: { type: String, trim: true, default: "" },
    fileType: { type: String, trim: true, default: "" },
    fileSize: { type: Number, min: 0, default: 0 },
  },
  {
    _id: false,
  },
);

const approvalSchema = new mongoose.Schema(
  {
    actionBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      enum: ["APPROVED", "REJECTED"],
      required: true,
    },
    remarks: { type: String, trim: true, default: "" },
    actionAt: { type: Date, default: Date.now },
  },
  {
    _id: false,
  },
);

const expenseSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ExpenseCategory",
      required: true,
    },
    expenseDate: { type: Date, required: true },
    amount: { type: Number, required: true, min: 0 },
    currency: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      default: "INR",
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: "" },
    receipts: { type: [receiptSchema], default: [] },
    status: {
      type: String,
      enum: [
        "DRAFT",
        "PENDING",
        "APPROVED",
        "REJECTED",
        "CANCELLED",
        "REIMBURSED",
      ],
      default: "DRAFT",
      index: true,
    },
    submittedAt: { type: Date, default: null },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    approvedAt: { type: Date, default: null },
    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    rejectedAt: { type: Date, default: null },
    rejectionReason: { type: String, trim: true, default: "" },
    approvalHistory: { type: [approvalSchema], default: [] },
    reimbursement: {
      reimbursedAt: { type: Date, default: null },
      reimbursedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
      referenceNumber: { type: String, trim: true, default: "" },
      remarks: { type: String, trim: true, default: "" },
    },
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

expenseSchema.index({ companyId: 1, employeeId: 1, expenseDate: -1 });
expenseSchema.index({ companyId: 1, status: 1, createdAt: -1 });
expenseSchema.index({ companyId: 1, categoryId: 1, expenseDate: -1 });

const Expense = mongoose.model("Expense", expenseSchema);

export default Expense;
