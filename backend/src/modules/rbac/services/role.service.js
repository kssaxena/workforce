import mongoose from "mongoose";

import Role from "../models/role.model.js";

export const getCompanyRoles = async ({ companyId }) => {
  if (!mongoose.Types.ObjectId.isValid(companyId)) {
    throw new Error("Invalid company ID");
  }

  return Role.find({
    companyId,
    isActive: true,
  })
    .select("_id name code description isSystemRole isActive")
    .sort({ name: 1 })
    .lean();
};
