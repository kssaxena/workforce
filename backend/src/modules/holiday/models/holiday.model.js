import mongoose from "mongoose";

const holidaySchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true, maxlength: 150 },
    date: { type: Date, required: true, index: true },
    description: { type: String, trim: true, maxlength: 1000 },
    type: {
      type: String,
      enum: ["PUBLIC", "NATIONAL", "FESTIVAL", "COMPANY", "OPTIONAL"],
      default: "COMPANY",
    },
    isOptional: { type: Boolean, default: false },
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
  { timestamps: true },
);

holidaySchema.index({ companyId: 1, date: 1, name: 1 }, { unique: true });
holidaySchema.index({ companyId: 1, date: 1, isActive: 1 });

const Holiday = mongoose.model("Holiday", holidaySchema);

export default Holiday;
