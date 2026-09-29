import UserRole from "../models/userRole.model.js";
import Role from "../models/role.model.js";

import { seedRoles } from "../seeds/role.seed.js";

export const initializeCompanyRBAC = async ({ companyId, userId, session }) => {
  /*
   * -----------------------------------------
   * 1. Create company roles
   * -----------------------------------------
   */

  await seedRoles({
    companyId,
    userId,
    session,
  });

  /*
   * -----------------------------------------
   * 2. Find SUPER_ADMIN role
   * -----------------------------------------
   */

  const superAdminRole = await Role.findOne({
    companyId,
    code: "SUPER_ADMIN",
    isActive: true,
  }).session(session);

  if (!superAdminRole) {
    throw new Error("SUPER_ADMIN role could not be created");
  }

  /*
   * -----------------------------------------
   * 3. Assign SUPER_ADMIN
   * -----------------------------------------
   */

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
      returnDocument: "after",
      session,
    },
  );

  return {
    roleId: superAdminRole._id,
  };
};
