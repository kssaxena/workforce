import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
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
    date: { type: Date, required: true, index: true },
    status: {
      type: String,
      enum: [
        "PRESENT",
        "ABSENT",
        "HALF_DAY",
        "ON_LEAVE",
        "HOLIDAY",
        "WEEK_OFF",
      ],
      default: "PRESENT",
    },
    checkIn: {
      timestamp: { type: Date },
      location: {
        latitude: { type: Number, min: -90, max: 90 },
        longitude: { type: Number, min: -180, max: 180 },
        accuracy: { type: Number, min: 0 },
      },
      verification: { type: String, enum: ["GPS", "MANUAL", "SYSTEM"] },
      distanceFromOffice: { type: Number, min: 0 },
    },
    checkOut: {
      timestamp: { type: Date },
      location: {
        latitude: { type: Number, min: -90, max: 90 },
        longitude: { type: Number, min: -180, max: 180 },
        accuracy: { type: Number, min: 0 },
      },
      verification: { type: String, enum: ["GPS", "MANUAL", "SYSTEM"] },
      distanceFromOffice: { type: Number, min: 0 },
    },
    totalWorkedMinutes: { type: Number, min: 0, default: 0 },
    remarks: { type: String, trim: true, maxlength: 1000 },
    source: {
      type: String,
      enum: ["WEB", "MOBILE", "ADMIN", "SYSTEM"],
      default: "WEB",
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  },
);

attendanceSchema.index(
  { companyId: 1, employeeId: 1, date: 1 },
  { unique: true },
);
attendanceSchema.index({ companyId: 1, date: 1, status: 1 });

const Attendance = mongoose.model("Attendance", attendanceSchema);

export default Attendance;
