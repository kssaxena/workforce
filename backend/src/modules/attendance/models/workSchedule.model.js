import mongoose from "mongoose";

const scheduleDaySchema = new mongoose.Schema(
  {
    dayOfWeek: { type: Number, required: true, min: 0, max: 6 },
    isWorkingDay: { type: Boolean, default: true },
    startTime: { type: String, default: "09:00" },
    endTime: { type: String, default: "18:00" },
    breakMinutes: { type: Number, default: 60, min: 0 },
  },
  {
    _id: false,
  },
);

const workScheduleSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, uppercase: true, trim: true },
    description: { type: String, trim: true },
    timezone: { type: String, default: "Asia/Kolkata" },
    days: {
      type: [scheduleDaySchema],
      required: true,
      validate: {
        validator: function (days) {
          return days.length === 7;
        },
        message: "Work schedule must contain exactly 7 days",
      },
    },
    isDefault: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  },
);

workScheduleSchema.index({ companyId: 1, code: 1 }, { unique: true });
workScheduleSchema.index({ companyId: 1, isDefault: 1 });

export const WorkSchedule = mongoose.model("WorkSchedule", workScheduleSchema);
