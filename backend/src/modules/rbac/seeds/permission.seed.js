import Permission from "../models/permission.model.js";
// import { PERMISSIONS } from "../constants/permissions.js";
import { PERMISSIONS } from "../constants/permission.js";

const permissionDefinitions = [
  {
    module: "company",
    resource: "company",
    action: "read",
    code: PERMISSIONS.COMPANY_READ,
    description: "View company information",
  },
  {
    module: "company",
    resource: "company",
    action: "update",
    code: PERMISSIONS.COMPANY_UPDATE,
    description: "Update company information",
  },

  {
    module: "employee",
    resource: "employee",
    action: "create",
    code: PERMISSIONS.EMPLOYEE_CREATE,
    description: "Create employees",
  },
  {
    module: "employee",
    resource: "employee",
    action: "read",
    code: PERMISSIONS.EMPLOYEE_READ,
    description: "View employees",
  },
  {
    module: "employee",
    resource: "employee",
    action: "update",
    code: PERMISSIONS.EMPLOYEE_UPDATE,
    description: "Update employees",
  },
  {
    module: "employee",
    resource: "employee",
    action: "delete",
    code: PERMISSIONS.EMPLOYEE_DELETE,
    description: "Delete employees",
  },

  {
    module: "attendance",
    resource: "attendance",
    action: "create",
    code: PERMISSIONS.ATTENDANCE_CREATE,
    description: "Create attendance",
  },
  {
    module: "attendance",
    resource: "attendance",
    action: "read",
    code: PERMISSIONS.ATTENDANCE_READ,
    description: "View attendance",
  },
  {
    module: "attendance",
    resource: "attendance",
    action: "update",
    code: PERMISSIONS.ATTENDANCE_UPDATE,
    description: "Update attendance",
  },
  {
    module: "attendance",
    resource: "attendance",
    action: "delete",
    code: PERMISSIONS.ATTENDANCE_DELETE,
    description: "Delete attendance",
  },
  {
    module: "attendance",
    resource: "attendance",
    action: "approve",
    code: PERMISSIONS.ATTENDANCE_APPROVE,
    description: "Approve attendance",
  },

  {
    module: "leave",
    resource: "leave",
    action: "create",
    code: PERMISSIONS.LEAVE_CREATE,
    description: "Create leave request",
  },
  {
    module: "leave",
    resource: "leave",
    action: "read",
    code: PERMISSIONS.LEAVE_READ,
    description: "View leave",
  },
  {
    module: "leave",
    resource: "leave",
    action: "update",
    code: PERMISSIONS.LEAVE_UPDATE,
    description: "Update leave",
  },
  {
    module: "leave",
    resource: "leave",
    action: "delete",
    code: PERMISSIONS.LEAVE_DELETE,
    description: "Delete leave",
  },
  {
    module: "leave",
    resource: "leave",
    action: "approve",
    code: PERMISSIONS.LEAVE_APPROVE,
    description: "Approve leave",
  },

  {
    module: "payroll",
    resource: "payroll",
    action: "read",
    code: PERMISSIONS.PAYROLL_READ,
    description: "View payroll",
  },
  {
    module: "payroll",
    resource: "payroll",
    action: "create",
    code: PERMISSIONS.PAYROLL_CREATE,
    description: "Create payroll",
  },
  {
    module: "payroll",
    resource: "payroll",
    action: "update",
    code: PERMISSIONS.PAYROLL_UPDATE,
    description: "Update payroll",
  },
  {
    module: "payroll",
    resource: "payroll",
    action: "process",
    code: PERMISSIONS.PAYROLL_PROCESS,
    description: "Process payroll",
  },

  {
    module: "expense",
    resource: "expense",
    action: "create",
    code: PERMISSIONS.EXPENSE_CREATE,
    description: "Create expense",
  },
  {
    module: "expense",
    resource: "expense",
    action: "read",
    code: PERMISSIONS.EXPENSE_READ,
    description: "View expenses",
  },
  {
    module: "expense",
    resource: "expense",
    action: "update",
    code: PERMISSIONS.EXPENSE_UPDATE,
    description: "Update expenses",
  },
  {
    module: "expense",
    resource: "expense",
    action: "approve",
    code: PERMISSIONS.EXPENSE_APPROVE,
    description: "Approve expenses",
  },

  {
    module: "report",
    resource: "report",
    action: "read",
    code: PERMISSIONS.REPORT_READ,
    description: "View reports",
  },

  {
    module: "organization",
    resource: "organization",
    action: "read",
    code: PERMISSIONS.ORGANIZATION_READ,
    description: "View organization hierarchy",
  },
  {
    module: "organization",
    resource: "organization",
    action: "manage",
    code: PERMISSIONS.ORGANIZATION_MANAGE,
    description: "Manage organization hierarchy",
  },

  {
    module: "rbac",
    resource: "role",
    action: "read",
    code: PERMISSIONS.ROLE_READ,
    description: "View roles",
  },
  {
    module: "rbac",
    resource: "role",
    action: "create",
    code: PERMISSIONS.ROLE_CREATE,
    description: "Create roles",
  },
  {
    module: "rbac",
    resource: "role",
    action: "update",
    code: PERMISSIONS.ROLE_UPDATE,
    description: "Update roles",
  },
  {
    module: "rbac",
    resource: "role",
    action: "delete",
    code: PERMISSIONS.ROLE_DELETE,
    description: "Delete roles",
  },

  {
    module: "rbac",
    resource: "permission",
    action: "read",
    code: PERMISSIONS.PERMISSION_READ,
    description: "View permissions",
  },
];

export const seedPermissions = async () => {
  for (const permission of permissionDefinitions) {
    await Permission.findOneAndUpdate(
      { code: permission.code },
      {
        $set: permission,
        $setOnInsert: {
          isActive: true,
        },
      },
      {
        upsert: true,
        returnDocument: "after",
      },
    );
  }

  console.log("RBAC permissions seeded successfully");
};
