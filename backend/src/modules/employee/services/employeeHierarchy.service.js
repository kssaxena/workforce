import Employee from "../models/employee.model.js";

import { getEmployeeScope } from "../../organization/services/organizationScope.service.js";

/**
 * Get employees who directly report to a specific employee.
 */
export const getDirectReports = async ({ userId, companyId, employeeId }) => {
  const scope = await getEmployeeScope({
    userId,
    companyId,
  });

  const query = {
    companyId,
    isActive: true,
    reportsTo: employeeId,
  };

  /*
   * Respect the same visibility rules used by
   * getVisibleEmployees().
   */
  if (scope.employeeIds !== null) {
    query._id = {
      $in: scope.employeeIds,
    };
  }

  return Employee.find(query)
    .populate("departmentId", "name code")
    .populate("organizationUnitId", "name code level")
    .populate("reportsTo", "employeeCode firstName lastName designation")
    .select("-__v")
    .sort({
      firstName: 1,
      lastName: 1,
    });
};

/**
 * Get the complete reporting hierarchy visible to the current user.
 *
 * The hierarchy is returned as a flat employee list with
 * populated reportsTo information. The frontend can then
 * construct the tree.
 */
export const getVisibleHierarchy = async ({ userId, companyId }) => {
  const scope = await getEmployeeScope({
    userId,
    companyId,
  });

  const query = {
    companyId,
    isActive: true,
  };

  if (scope.employeeIds !== null) {
    query._id = {
      $in: scope.employeeIds,
    };
  }

  return Employee.find(query)
    .populate("departmentId", "name code")
    .populate("organizationUnitId", "name code level")
    .populate("reportsTo", "employeeCode firstName lastName designation")
    .select("-__v")
    .sort({
      firstName: 1,
      lastName: 1,
    });
};
