import asyncHandler from "../../../core/middleware/asyncHandler.js";
import ApiResponse from "../../../core/utils/ApiResponse.js";

import {
  createAttendancePolicy,
  getAttendancePolicy,
  updateAttendancePolicy,
} from "../services/attendancePolicy.service.js";

export const createAttendancePolicyController = asyncHandler(
  async (req, res) => {
    const policy = await createAttendancePolicy({
      companyId: req.user.companyId,
      userId: req.user.userId,
      data: req.body,
    });

    return res
      .status(201)
      .json(
        new ApiResponse(201, policy, "Attendance policy created successfully"),
      );
  },
);

export const getAttendancePolicyController = asyncHandler(async (req, res) => {
  const policy = await getAttendancePolicy({
    companyId: req.user.companyId,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, policy, "Attendance policy fetched successfully"),
    );
});

export const updateAttendancePolicyController = asyncHandler(
  async (req, res) => {
    const policy = await updateAttendancePolicy({
      companyId: req.user.companyId,
      userId: req.user.userId,
      data: req.body,
    });

    return res
      .status(200)
      .json(
        new ApiResponse(200, policy, "Attendance policy updated successfully"),
      );
  },
);
