import mongoose from "mongoose";

const leaveTypeSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      maxlength: 30,
    },
    description: { type: String, trim: true, maxlength: 500 },
    annualDays: { type: Number, required: true, min: 0, default: 0 },
    isPaid: { type: Boolean, default: true },
    requiresApproval: { type: Boolean, default: true },
    allowHalfDay: { type: Boolean, default: true },
    allowNegativeBalance: { type: Boolean, default: false },
    carryForward: { type: Boolean, default: false },
    maxCarryForwardDays: { type: Number, min: 0, default: 0 },
    isActive: { type: Boolean, default: true, index: true },
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

leaveTypeSchema.index({ companyId: 1, code: 1 }, { unique: true });

export default mongoose.model("LeaveType", leaveTypeSchema);
