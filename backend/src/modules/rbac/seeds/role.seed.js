import Role from "../models/role.model.js";
import Permission from "../models/permission.model.js";
import RolePermission from "../models/rolePermission.model.js";

import { SYSTEM_ROLES } from "../constants/roles.js";
// import { PERMISSIONS } from "../constants/permissions.js";
import { PERMISSIONS } from "../constants/permission.js";

const roleDefinitions = [
  {
    name: "Super Admin",
    code: SYSTEM_ROLES.SUPER_ADMIN,
    description: "Full access to the company",
    permissions: Object.values(PERMISSIONS),
  },

  {
    name: "HR Admin",
    code: SYSTEM_ROLES.HR_ADMIN,
    description: "Manage employees, attendance, leave and HR operations",
    permissions: [
      PERMISSIONS.COMPANY_READ,
      PERMISSIONS.EMPLOYEE_CREATE,
      PERMISSIONS.EMPLOYEE_READ,
      PERMISSIONS.EMPLOYEE_UPDATE,
      PERMISSIONS.EMPLOYEE_DELETE,

      PERMISSIONS.ATTENDANCE_CREATE,
      PERMISSIONS.ATTENDANCE_READ,
      PERMISSIONS.ATTENDANCE_UPDATE,
      PERMISSIONS.ATTENDANCE_APPROVE,

      PERMISSIONS.LEAVE_CREATE,
      PERMISSIONS.LEAVE_READ,
      PERMISSIONS.LEAVE_UPDATE,
      PERMISSIONS.LEAVE_DELETE,
      PERMISSIONS.LEAVE_APPROVE,

      PERMISSIONS.PAYROLL_READ,

      PERMISSIONS.EXPENSE_READ,
      PERMISSIONS.EXPENSE_APPROVE,

      PERMISSIONS.REPORT_READ,

      PERMISSIONS.ORGANIZATION_READ,
      PERMISSIONS.ORGANIZATION_MANAGE,

      PERMISSIONS.ROLE_READ,
      PERMISSIONS.ROLE_CREATE,
      PERMISSIONS.ROLE_UPDATE,

      PERMISSIONS.PERMISSION_READ,
    ],
  },

  {
    name: "Manager",
    code: SYSTEM_ROLES.MANAGER,
    description: "Manage assigned teams and operational activities",
    permissions: [
      PERMISSIONS.COMPANY_READ,

      PERMISSIONS.EMPLOYEE_READ,
      PERMISSIONS.EMPLOYEE_UPDATE,

      PERMISSIONS.ATTENDANCE_READ,
      PERMISSIONS.ATTENDANCE_APPROVE,

      PERMISSIONS.LEAVE_READ,
      PERMISSIONS.LEAVE_APPROVE,

      PERMISSIONS.EXPENSE_READ,
      PERMISSIONS.EXPENSE_APPROVE,

      PERMISSIONS.REPORT_READ,

      PERMISSIONS.ORGANIZATION_READ,
    ],
  },

  {
    name: "Team Leader",
    code: SYSTEM_ROLES.TEAM_LEADER,
    description: "Manage assigned team members",
    permissions: [
      PERMISSIONS.COMPANY_READ,

      PERMISSIONS.EMPLOYEE_READ,

      PERMISSIONS.ATTENDANCE_CREATE,
      PERMISSIONS.ATTENDANCE_READ,

      PERMISSIONS.LEAVE_READ,
      PERMISSIONS.LEAVE_APPROVE,

      PERMISSIONS.EXPENSE_CREATE,
      PERMISSIONS.EXPENSE_READ,

      PERMISSIONS.ORGANIZATION_READ,
    ],
  },

  {
    name: "Employee",
    code: SYSTEM_ROLES.EMPLOYEE,
    description: "Standard employee access",
    permissions: [
      PERMISSIONS.COMPANY_READ,

      PERMISSIONS.EMPLOYEE_READ,

      PERMISSIONS.ATTENDANCE_CREATE,
      PERMISSIONS.ATTENDANCE_READ,

      PERMISSIONS.LEAVE_CREATE,
      PERMISSIONS.LEAVE_READ,

      PERMISSIONS.EXPENSE_CREATE,
      PERMISSIONS.EXPENSE_READ,

      PERMISSIONS.ORGANIZATION_READ,
    ],
  },
];

export const seedRoles = async ({ companyId, userId, session = null }) => {
  for (const roleDefinition of roleDefinitions) {
    const role = await Role.findOneAndUpdate(
      {
        companyId,
        code: roleDefinition.code,
      },
      {
        $set: {
          name: roleDefinition.name,

          description: roleDefinition.description,

          isSystemRole: true,

          isActive: true,

          updatedBy: userId,
        },

        $setOnInsert: {
          createdBy: userId,
        },
      },
      {
        upsert: true,
        returnDocument: "after",
        session,
      },
    );

    for (const permissionCode of roleDefinition.permissions) {
      const permission = await Permission.findOne({
        code: permissionCode,
        isActive: true,
      }).session(session);

      if (!permission) {
        throw new Error(`Permission not found: ${permissionCode}`);
      }

      await RolePermission.findOneAndUpdate(
        {
          roleId: role._id,
          permissionId: permission._id,
        },
        {
          $set: {
            granted: true,
          },
        },
        {
          upsert: true,
          session,
        },
      );
    }
  }

  return true;
};
