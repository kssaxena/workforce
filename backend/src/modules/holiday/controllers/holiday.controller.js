import asyncHandler from "../../../core/middleware/asyncHandler.js";
import ApiResponse from "../../../core/utils/ApiResponse.js";

import {
  createHoliday,
  getHolidays,
  getHolidayById,
  updateHoliday,
  deactivateHoliday,
} from "../services/holiday.service.js";

export const createHolidayController = asyncHandler(async (req, res) => {
  const holiday = await createHoliday({
    companyId: req.user.companyId,
    userId: req.user.userId,
    data: req.body,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, holiday, "Holiday created successfully"));
});

export const getHolidaysController = asyncHandler(async (req, res) => {
  const holidays = await getHolidays({
    companyId: req.user.companyId,
    startDate: req.query.startDate,
    endDate: req.query.endDate,
    includeInactive: req.query.includeInactive === "true",
  });

  return res
    .status(200)
    .json(new ApiResponse(200, holidays, "Holidays fetched successfully"));
});

export const getHolidayByIdController = asyncHandler(async (req, res) => {
  const holiday = await getHolidayById({
    companyId: req.user.companyId,
    holidayId: req.params.holidayId,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, holiday, "Holiday fetched successfully"));
});

export const updateHolidayController = asyncHandler(async (req, res) => {
  const holiday = await updateHoliday({
    companyId: req.user.companyId,
    holidayId: req.params.holidayId,
    userId: req.user.userId,
    data: req.body,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, holiday, "Holiday updated successfully"));
});

export const deactivateHolidayController = asyncHandler(async (req, res) => {
  const holiday = await deactivateHoliday({
    companyId: req.user.companyId,
    holidayId: req.params.holidayId,
    userId: req.user.userId,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, holiday, "Holiday deactivated successfully"));
});
