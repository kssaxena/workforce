import UserRole from "../models/userRole.model.js";
import RolePermission from "../models/rolePermission.model.js";
import Permission from "../models/permission.model.js";

export const hasPermission = async ({ userId, companyId, permissionCode }) => {
  const userRoles = await UserRole.find({
    userId,
    companyId,
    isActive: true,
  }).select("roleId");

  if (!userRoles.length) {
    return false;
  }

  const roleIds = userRoles.map((item) => item.roleId);

  const permission = await Permission.findOne({
    code: permissionCode,
    isActive: true,
  }).select("_id");

  if (!permission) {
    return false;
  }

  const rolePermission = await RolePermission.findOne({
    roleId: { $in: roleIds },
    permissionId: permission._id,
    granted: true,
  });

  return Boolean(rolePermission);
};
