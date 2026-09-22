import asyncHandler from "../../../core/middleware/asyncHandler.js";
import ApiResponse from "../../../core/utils/ApiResponse.js";

import { createEmployee } from "../services/employee.service.js";

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
