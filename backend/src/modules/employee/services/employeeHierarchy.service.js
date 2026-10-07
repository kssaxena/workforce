import Employee from "../models/employee.model.js";
import mongoose from "mongoose";
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

export const updateEmployeeReportingManager = async ({
  userId,
  companyId,
  employeeId,
  reportsTo,
}) => {
  const scope = await getEmployeeScope({
    userId,
    companyId,
  });

  /*
   * ----------------------------------------------------
   * 1. Validate employee ID
   * ----------------------------------------------------
   */

  if (!mongoose.Types.ObjectId.isValid(employeeId)) {
    throw new Error("Invalid employee ID");
  }

  /*
   * ----------------------------------------------------
   * 2. Validate visibility of employee being modified
   * ----------------------------------------------------
   */

  const employeeQuery = {
    _id: employeeId,
    companyId,
    isActive: true,
  };

  if (scope.employeeIds !== null) {
    employeeQuery._id = {
      $in: scope.employeeIds,
      $eq: employeeId,
    };
  }

  const employee = await Employee.findOne(employeeQuery);

  if (!employee) {
    throw new Error("Employee not found");
  }

  /*
   * ----------------------------------------------------
   * 3. Remove reporting manager
   * ----------------------------------------------------
   */

  if (!reportsTo) {
    employee.reportsTo = null;
    employee.updatedBy = userId;

    await employee.save();

    return employee;
  }

  /*
   * ----------------------------------------------------
   * 4. Validate reporting manager ID
   * ----------------------------------------------------
   */

  if (!mongoose.Types.ObjectId.isValid(reportsTo)) {
    throw new Error("Invalid reporting manager ID");
  }

  /*
   * ----------------------------------------------------
   * 5. Prevent self reporting
   * ----------------------------------------------------
   */

  if (employee._id.toString() === reportsTo.toString()) {
    throw new Error("An employee cannot report to themselves");
  }

  /*
   * ----------------------------------------------------
   * 6. Find new manager
   * ----------------------------------------------------
   */

  const manager = await Employee.findOne({
    _id: reportsTo,
    companyId,
    isActive: true,
  });

  if (!manager) {
    throw new Error("Reporting manager not found");
  }

  /*
   * ----------------------------------------------------
   * 7. Manager must be visible to current user
   * ----------------------------------------------------
   */

  if (
    scope.employeeIds !== null &&
    !scope.employeeIds.some((id) => id.toString() === manager._id.toString())
  ) {
    throw new Error("You are not allowed to assign this reporting manager");
  }

  /*
   * ----------------------------------------------------
   * 8. Prevent circular reporting
   *
   * Walk upward from the proposed manager.
   * If we eventually reach the employee being modified,
   * assigning this manager would create a cycle.
   * ----------------------------------------------------
   */

  let currentManagerId = manager._id;
  const visited = new Set();

  while (currentManagerId) {
    const currentId = currentManagerId.toString();

    if (visited.has(currentId)) {
      throw new Error(
        "Invalid reporting hierarchy: an existing reporting cycle was detected",
      );
    }

    visited.add(currentId);

    if (currentId === employee._id.toString()) {
      throw new Error(
        "Cannot assign this reporting manager because it would create a reporting cycle",
      );
    }

    const currentManager = await Employee.findOne({
      _id: currentManagerId,
      companyId,
      isActive: true,
    }).select("reportsTo");

    if (!currentManager) {
      break;
    }

    currentManagerId = currentManager.reportsTo;
  }

  /*
   * ----------------------------------------------------
   * 9. Update reporting relationship
   * ----------------------------------------------------
   */

  employee.reportsTo = manager._id;
  employee.updatedBy = userId;

  await employee.save();

  return Employee.findById(employee._id)
    .populate("departmentId", "name code")
    .populate("organizationUnitId", "name code level")
    .populate("reportsTo", "employeeCode firstName lastName designation")
    .select("-__v");
};
