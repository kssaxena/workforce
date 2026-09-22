import asyncHandler from "../../../core/middleware/asyncHandler.js";
import ApiResponse from "../../../core/utils/ApiResponse.js";

import { createEmployee } from "../services/employee.service.js";

import {
  getVisibleEmployees,
  getVisibleEmployeeById,
} from "../services/employeeQuery.service.js";

export const createEmployeeController = asyncHandler(async (req, res) => {
  const result = await createEmployee({
    companyId: req.user.companyId,
    createdBy: req.user.userId,
    data: req.body,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, result, "Employee created successfully"));
});

export const getEmployeesController = asyncHandler(async (req, res) => {
  const employees = await getVisibleEmployees({
    userId: req.user.userId,
    companyId: req.user.companyId,
    filters: {
      departmentId: req.query.departmentId,

      organizationUnitId: req.query.organizationUnitId,

      employmentStatus: req.query.employmentStatus,

      search: req.query.search,
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, employees, "Employees fetched successfully"));
});

export const getEmployeeController = asyncHandler(async (req, res) => {
  const employee = await getVisibleEmployeeById({
    userId: req.user.userId,
    companyId: req.user.companyId,
    employeeId: req.params.employeeId,
  });

  if (!employee) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, "Employee not found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, employee, "Employee fetched successfully"));
});
