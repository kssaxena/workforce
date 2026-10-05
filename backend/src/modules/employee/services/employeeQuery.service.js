import Employee from "../models/employee.model.js";

import { getEmployeeScope } from "../../organization/services/organizationScope.service.js";

export const getVisibleEmployees = async ({
  userId,
  companyId,
  filters = {},
}) => {
  const scope = await getEmployeeScope({
    userId,
    companyId,
  });

  const query = {
    companyId,
    isActive: true,
  };

  /*
   * Company-wide access
   */
  if (scope.employeeIds !== null) {
    query._id = {
      $in: scope.employeeIds,
    };
  }

  /*
   * Optional filters
   */
  if (filters.departmentId) {
    query.departmentId = filters.departmentId;
  }

  if (filters.organizationUnitId) {
    query.organizationUnitId = filters.organizationUnitId;
  }

  if (filters.employmentStatus) {
    query.employmentStatus = filters.employmentStatus;
  }

  if (filters.search) {
    const searchRegex = new RegExp(filters.search, "i");

    query.$or = [
      {
        firstName: searchRegex,
      },
      {
        lastName: searchRegex,
      },
      {
        employeeCode: searchRegex,
      },
      {
        designation: searchRegex,
      },
    ];
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

export const getVisibleEmployeeById = async ({
  userId,
  companyId,
  employeeId,
}) => {
  const scope = await getEmployeeScope({
    userId,
    companyId,
  });

  const query = {
    _id: employeeId,
    companyId,
    isActive: true,
  };

  if (scope.employeeIds !== null) {
    query._id = {
      $in: scope.employeeIds,
      $eq: employeeId,
    };
  }

  return Employee.findOne(query)
    .populate("departmentId", "name code")
    .populate("organizationUnitId", "name code level")
    .populate("reportsTo", "employeeCode firstName lastName designation")
    .select("-__v");
};
