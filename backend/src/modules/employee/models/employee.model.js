import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
    employeeCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, trim: true },
    dateOfBirth: { type: Date },
    gender: {
      type: String,
      enum: ["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"],
    },
    joiningDate: { type: Date, required: true },
    employmentType: {
      type: String,
      enum: ["FULL_TIME", "PART_TIME", "CONTRACT", "INTERN", "TEMPORARY"],
      default: "FULL_TIME",
    },
    employmentStatus: {
      type: String,
      enum: ["ACTIVE", "ON_LEAVE", "SUSPENDED", "RESIGNED", "TERMINATED"],
      default: "ACTIVE",
    },
    designation: { type: String, trim: true },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      default: null,
    },
    organizationUnitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OrganizationUnit",
      default: null,
    },
    reportsTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },
    workScheduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WorkSchedule",
      default: null,
      index: true,
    },

    contact: {
      phone: { type: String, trim: true },
      alternatePhone: { type: String, trim: true },
      personalEmail: { type: String, lowercase: true, trim: true },
      workEmail: { type: String, lowercase: true, trim: true },
    },
    address: {
      addressLine1: { type: String, trim: true },
      addressLine2: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      country: { type: String, trim: true, default: "India" },
      postalCode: { type: String, trim: true },
      latitude: { type: Number },
      longitude: { type: Number },
    },
    profileImage: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  },
);

employeeSchema.index({ companyId: 1, employeeCode: 1 }, { unique: true });
employeeSchema.index({ companyId: 1, departmentId: 1 });
employeeSchema.index({ companyId: 1, organizationUnitId: 1 });
employeeSchema.index({ companyId: 1, reportsTo: 1 });

const Employee = mongoose.model("Employee", employeeSchema);

export default Employee;
