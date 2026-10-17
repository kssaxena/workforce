import asyncHandler from "../../../core/middleware/asyncHandler.js";
import ApiResponse from "../../../core/utils/ApiResponse.js";

import { createEmployee } from "../services/employee.service.js";

import {
  getVisibleEmployees,
  getVisibleEmployeeById,
} from "../services/employeeQuery.service.js";

import {
  getDirectReports,
  getVisibleHierarchy,
  updateEmployeeReportingManager,
} from "../services/employeeHierarchy.service.js";

import {
  searchEmployeeDirectory,
  getDirectoryProfile,
} from "../services/employeeDirectory.service.js";

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

export const getDirectReportsController = asyncHandler(async (req, res) => {
  const employees = await getDirectReports({
    userId: req.user.userId,
    companyId: req.user.companyId,
    employeeId: req.params.employeeId,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, employees, "Direct reports fetched successfully"),
    );
});

export const getHierarchyController = asyncHandler(async (req, res) => {
  const employees = await getVisibleHierarchy({
    userId: req.user.userId,
    companyId: req.user.companyId,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        employees,
        "Employee hierarchy fetched successfully",
      ),
    );
});

export const updateEmployeeReportingController = asyncHandler(
  async (req, res) => {
    const employee = await updateEmployeeReportingManager({
      userId: req.user.userId,
      companyId: req.user.companyId,
      employeeId: req.params.employeeId,
      reportsTo: req.body.reportsTo,
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          employee,
          "Reporting manager updated successfully",
        ),
      );
  },
);

export const searchEmployeeDirectoryController = asyncHandler(
  async (req, res) => {
    const { departmentId, organizationUnitId } = req.query;

    for (const [label, value] of [
      ["departmentId", departmentId],
      ["organizationUnitId", organizationUnitId],
    ]) {
      if (value && !mongoose.Types.ObjectId.isValid(value)) {
        throw new ApiError(400, `Invalid ${label}`);
      }
    }

    const result = await searchEmployeeDirectory({
      companyId: req.user.companyId,
      search: req.query.search,
      departmentId,
      organizationUnitId,
      page: req.query.page,
      limit: req.query.limit,
    });

    return res
      .status(200)
      .json(
        new ApiResponse(200, result, "Employee directory fetched successfully"),
      );
  },
);

export const getDirectoryProfileController = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.employeeId)) {
    throw new ApiError(400, "Invalid employee ID");
  }

  const employee = await getDirectoryProfile({
    companyId: req.user.companyId,
    employeeId: req.params.employeeId,
  });

  if (!employee) {
    throw new ApiError(404, "Directory profile not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, employee, "Directory profile fetched successfully"),
    );
});
