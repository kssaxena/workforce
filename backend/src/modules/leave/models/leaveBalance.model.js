import mongoose from "mongoose";

const leaveBalanceSchema = new mongoose.Schema(
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
    leaveTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LeaveType",
      required: true,
      index: true,
    },
    year: { type: Number, required: true, min: 2000, max: 3000 },
    openingBalance: { type: Number, min: 0, default: 0 },
    accrued: { type: Number, min: 0, default: 0 },
    carriedForward: { type: Number, min: 0, default: 0 },
    used: { type: Number, min: 0, default: 0 },
    pending: { type: Number, min: 0, default: 0 },
    adjusted: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  },
);

leaveBalanceSchema.index(
  { companyId: 1, employeeId: 1, leaveTypeId: 1, year: 1 },
  { unique: true },
);

leaveBalanceSchema.virtual("available").get(function () {
  return Math.max(
    0,
    this.openingBalance +
      this.accrued +
      this.carriedForward +
      this.adjusted -
      this.used -
      this.pending,
  );
});

leaveBalanceSchema.set("toJSON", { virtuals: true });
leaveBalanceSchema.set("toObject", { virtuals: true });

export default mongoose.model("LeaveBalance", leaveBalanceSchema);
