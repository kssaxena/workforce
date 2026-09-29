import mongoose from "mongoose";

const leaveRequestSchema = new mongoose.Schema(
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
    },
    startDate: { type: Date, required: true, index: true },
    endDate: { type: Date, required: true, index: true },
    totalDays: { type: Number, required: true, min: 0.5 },
    reason: { type: String, trim: true, maxlength: 1000 },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED", "CANCELLED"],
      default: "PENDING",
      index: true,
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    decisionReason: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    decidedAt: { type: Date, default: null },
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

leaveRequestSchema.index({
  companyId: 1,
  employeeId: 1,
  startDate: 1,
  endDate: 1,
});
leaveRequestSchema.index({
  companyId: 1,
  status: 1,
  startDate: 1,
});

export default mongoose.model("LeaveRequest", leaveRequestSchema);
