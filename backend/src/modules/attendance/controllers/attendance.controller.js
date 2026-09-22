import asyncHandler from "../../../core/middleware/asyncHandler.js";
import ApiResponse from "../../../core/utils/ApiResponse.js";
import Company from "../../company/models/company.model.js";
import Employee from "../../employee/models/employee.model.js";

import { checkIn } from "../services/attendance.service.js";
import { checkOut } from "../services/attendance.service.js";

import {
  getEmployeeAttendance,
  getTodayAttendance,
} from "../services/attendanceQuery.service.js";

export const checkInController = asyncHandler(async (req, res) => {
  const attendance = await checkIn({
    userId: req.user.userId,
    companyId: req.user.companyId,

    latitude: req.body.latitude,
    longitude: req.body.longitude,
    accuracy: req.body.accuracy,

    source: req.body.source || "WEB",
  });

  return res
    .status(201)
    .json(new ApiResponse(201, attendance, "Check-in successful"));
});

export const checkOutController = asyncHandler(async (req, res) => {
  const attendance = await checkOut({
    userId: req.user.userId,
    companyId: req.user.companyId,

    latitude: req.body.latitude,
    longitude: req.body.longitude,
    accuracy: req.body.accuracy,

    source: req.body.source || "WEB",
  });

  return res
    .status(200)
    .json(new ApiResponse(200, attendance, "Check-out successful"));
});

export const getMyAttendanceController = asyncHandler(async (req, res) => {
  const employee = await Employee.findOne({
    userId: req.user.userId,
    companyId: req.user.companyId,
    isActive: true,
  }).select("_id");

  if (!employee) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, "Employee profile not found"));
  }

  const company = await Company.findById(req.user.companyId).select(
    "settings.timezone",
  );

  const attendance = await getEmployeeAttendance({
    employeeId: employee._id,
    companyId: req.user.companyId,
    startDate: req.query.startDate,
    endDate: req.query.endDate,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        attendance,
        "Attendance history fetched successfully",
      ),
    );
});
