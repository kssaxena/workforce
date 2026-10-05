import mongoose from "mongoose";

const organizationUnitSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    description: { type: String, trim: true },
    parentUnitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OrganizationUnit",
      default: null,
    },
    level: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  },
);

organizationUnitSchema.index({ companyId: 1, code: 1 }, { unique: true });
organizationUnitSchema.index({ companyId: 1, parentUnitId: 1 });

const OrganizationUnit = mongoose.model(
  "OrganizationUnit",
  organizationUnitSchema,
);

export default OrganizationUnit;
