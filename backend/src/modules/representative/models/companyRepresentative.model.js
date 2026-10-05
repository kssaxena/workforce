import mongoose from "mongoose";

const companyRepresentativeSchema = new mongoose.Schema(
  {
    /* =========================
         RELATIONSHIPS
      ========================= */

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },

    /* =========================
         REPRESENTATIVE INFORMATION
      ========================= */

    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, trim: true },
    designation: { type: String, trim: true },
    representativeType: {
      type: String,
      enum: ["OWNER", "ADMIN", "HR", "OPERATIONS", "FINANCE", "OTHER"],
      default: "OWNER",
    },

    /* =========================
         STATUS
      ========================= */

    status: {
      type: String,
      enum: ["INVITED", "ACTIVE", "SUSPENDED", "INACTIVE"],
      default: "ACTIVE",
    },

    /* =========================
         PRIMARY REPRESENTATIVE
      ========================= */

    isPrimary: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
);

/*
 * A user can be a representative
 * of multiple companies in the future.
 */

companyRepresentativeSchema.index({
  userId: 1,
  companyId: 1,
});

companyRepresentativeSchema.index({
  companyId: 1,
  isPrimary: 1,
});

const CompanyRepresentative = mongoose.model(
  "CompanyRepresentative",
  companyRepresentativeSchema,
);

export default CompanyRepresentative;
