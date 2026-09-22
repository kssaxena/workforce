import {
  createWorkSchedule,
  getWorkSchedules,
  getWorkScheduleById,
  updateWorkSchedule,
  deactivateWorkSchedule,
} from "../services/workSchedule.service.js";

import asyncHandler from "../../../core/middleware/asyncHandler.js";
import ApiResponse from "../../../core/utils/ApiResponse.js";

export const createWorkScheduleController = asyncHandler(async (req, res) => {
  const schedule = await createWorkSchedule({
    companyId: req.user.companyId,
    userId: req.user.userId,
    data: req.body,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, schedule, "Work schedule created successfully"));
});

export const getWorkSchedulesController = asyncHandler(async (req, res) => {
  const schedules = await getWorkSchedules({
    companyId: req.user.companyId,
    includeInactive: req.query.includeInactive === "true",
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, schedules, "Work schedules fetched successfully"),
    );
});

export const getWorkScheduleByIdController = asyncHandler(async (req, res) => {
  const schedule = await getWorkScheduleById({
    companyId: req.user.companyId,
    scheduleId: req.params.scheduleId,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, schedule, "Work schedule fetched successfully"));
});

export const updateWorkScheduleController = asyncHandler(async (req, res) => {
  const schedule = await updateWorkSchedule({
    companyId: req.user.companyId,
    scheduleId: req.params.scheduleId,
    userId: req.user.userId,
    data: req.body,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, schedule, "Work schedule updated successfully"));
});

export const deactivateWorkScheduleController = asyncHandler(
  async (req, res) => {
    const schedule = await deactivateWorkSchedule({
      companyId: req.user.companyId,
      scheduleId: req.params.scheduleId,
      userId: req.user.userId,
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          schedule,
          "Work schedule deactivated successfully",
        ),
      );
  },
);
