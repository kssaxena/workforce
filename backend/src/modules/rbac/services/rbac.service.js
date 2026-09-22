import mongoose from "mongoose";

import UserRole from "../models/userRole.model.js";
import Role from "../models/role.model.js";

import { seedPermissions } from "../seeds/permission.seed.js";
import { seedRoles } from "../seeds/role.seed.js";

export const initializeCompanyRBAC = async ({ companyId, userId, session }) => {
  await seedPermissions();

  await seedRoles(companyId, userId);

  const superAdminRole = await Role.findOne({
    companyId,
    code: "SUPER_ADMIN",
    isActive: true,
  }).session(session);

  if (!superAdminRole) {
    throw new Error("SUPER_ADMIN role could not be created");
  }

  await UserRole.findOneAndUpdate(
    {
      userId,
      companyId,
      roleId: superAdminRole._id,
    },
    {
      $set: {
        isActive: true,
        assignedBy: userId,
        assignedAt: new Date(),
      },
    },
    {
      upsert: true,
      new: true,
      session,
    },
  );

  return {
    roleId: superAdminRole._id,
  };
};
