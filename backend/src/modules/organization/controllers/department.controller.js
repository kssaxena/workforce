import asyncHandler from "../../../core/middleware/asyncHandler.js";
import ApiResponse from "../../../core/utils/ApiResponse.js";

import {
  createDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  deactivateDepartment,
} from "../services/department.service.js";

export const createDepartmentController = asyncHandler(async (req, res) => {
  const department = await createDepartment({
    companyId: req.user.companyId,
    userId: req.user.userId,
    data: req.body,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, department, "Department created successfully"));
});

export const getDepartmentsController = asyncHandler(async (req, res) => {
  const departments = await getDepartments({
    companyId: req.user.companyId,
    includeInactive: req.query.includeInactive === "true",
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, departments, "Departments fetched successfully"),
    );
});

export const getDepartmentController = asyncHandler(async (req, res) => {
  const department = await getDepartmentById({
    companyId: req.user.companyId,
    departmentId: req.params.departmentId,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, department, "Department fetched successfully"));
});

export const updateDepartmentController = asyncHandler(async (req, res) => {
  const department = await updateDepartment({
    companyId: req.user.companyId,
    departmentId: req.params.departmentId,
    userId: req.user.userId,
    data: req.body,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, department, "Department updated successfully"));
});

export const deactivateDepartmentController = asyncHandler(async (req, res) => {
  const department = await deactivateDepartment({
    companyId: req.user.companyId,
    departmentId: req.params.departmentId,
    userId: req.user.userId,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, department, "Department deactivated successfully"),
    );
});
