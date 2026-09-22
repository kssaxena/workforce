import Employee from "../../employee/models/employee.model.js";
import UserRole from "../../rbac/models/userRole.model.js";
import Role from "../../rbac/models/role.model.js";

const getUserRoleCodes = async ({ userId, companyId }) => {
  const userRoles = await UserRole.find({
    userId,
    companyId,
    isActive: true,
  }).populate({
    path: "roleId",
    select: "code",
  });

  return userRoles.map((item) => item.roleId?.code).filter(Boolean);
};

const getSubordinateEmployeeIds = async ({ employeeId, companyId }) => {
  const employees = await Employee.find({
    companyId,
    isActive: true,
  }).select("_id reportsTo");

  const childrenMap = new Map();

  for (const employee of employees) {
    const parentId = employee.reportsTo?.toString();

    if (!parentId) continue;

    if (!childrenMap.has(parentId)) {
      childrenMap.set(parentId, []);
    }

    childrenMap.get(parentId).push(employee._id.toString());
  }

  const result = [];
  const queue = [employeeId.toString()];

  while (queue.length) {
    const currentId = queue.shift();

    const children = childrenMap.get(currentId) || [];

    for (const childId of children) {
      result.push(childId);
      queue.push(childId);
    }
  }

  return result;
};

export const getEmployeeScope = async ({ userId, companyId }) => {
  const roleCodes = await getUserRoleCodes({
    userId,
    companyId,
  });

  /*
   * SUPER_ADMIN
   *
   * Full company visibility.
   */
  if (roleCodes.includes("SUPER_ADMIN")) {
    return {
      type: "COMPANY",
      employeeIds: null,
    };
  }

  /*
   * HR_ADMIN
   *
   * Full company employee visibility.
   */
  if (roleCodes.includes("HR_ADMIN")) {
    return {
      type: "COMPANY",
      employeeIds: null,
    };
  }

  /*
   * Find the employee profile
   * associated with the logged-in user.
   */
  const employee = await Employee.findOne({
    userId,
    companyId,
    isActive: true,
  }).select("_id");

  /*
   * A company representative may not
   * necessarily be an employee.
   */
  if (!employee) {
    return {
      type: "NONE",
      employeeIds: [],
    };
  }

  /*
   * MANAGER / TEAM_LEADER
   *
   * Access themselves + all
   * employees below them.
   */
  if (roleCodes.includes("MANAGER") || roleCodes.includes("TEAM_LEADER")) {
    const subordinateIds = await getSubordinateEmployeeIds({
      employeeId: employee._id,
      companyId,
    });

    return {
      type: "HIERARCHY",
      employeeIds: [employee._id.toString(), ...subordinateIds],
    };
  }

  /*
   * EMPLOYEE
   *
   * Access only themselves.
   */
  return {
    type: "SELF",
    employeeIds: [employee._id.toString()],
  };
};
