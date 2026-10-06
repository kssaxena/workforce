import asyncHandler from "../../../core/middleware/asyncHandler.js";
import ApiResponse from "../../../core/utils/ApiResponse.js";
import Company from "../../company/models/company.model.js";
import Employee from "../../employee/models/employee.model.js";

import { checkIn } from "../services/attendance.service.js";
import { checkOut } from "../services/attendance.service.js";

import {
  getEmployeeAttendance,
  getTodayAttendance,
  getCompanyAttendance,
  getAttendanceSummary,
} from "../services/attendanceQuery.service.js";

import { regularizeAttendance } from "../services/attendanceRegularization.service.js";

import {
  createAttendanceRegularizationRequest,
  getMyAttendanceRegularizationRequests,
  getCompanyAttendanceRegularizationRequests,
} from "../services/attendanceRegularizationRequest.service.js";

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

  if (!company) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, "Company not found"));
  }

  const attendance = await getEmployeeAttendance({
    employeeId: employee._id,
    companyId: req.user.companyId,
    startDate: req.query.startDate,
    endDate: req.query.endDate,
    timezone: company.settings?.timezone || "Asia/Kolkata",
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

export const getCompanyAttendanceController = asyncHandler(async (req, res) => {
  const attendance = await getCompanyAttendance({
    companyId: req.user.companyId,

    startDate: req.query.startDate,
    endDate: req.query.endDate,

    employeeId: req.query.employeeId,
    departmentId: req.query.departmentId,
    organizationUnitId: req.query.organizationUnitId,

    status: req.query.status,
    search: req.query.search,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        attendance,
        "Company attendance fetched successfully",
      ),
    );
});

export const getAttendanceSummaryController = asyncHandler(async (req, res) => {
  const summary = await getAttendanceSummary({
    companyId: req.user.companyId,

    startDate: req.query.startDate,
    endDate: req.query.endDate,

    employeeId: req.query.employeeId,
    departmentId: req.query.departmentId,
    organizationUnitId: req.query.organizationUnitId,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, summary, "Attendance summary fetched successfully"),
    );
});

export const regularizeAttendanceController = asyncHandler(async (req, res) => {
  const attendance = await regularizeAttendance({
    companyId: req.user.companyId,
    updatedBy: req.user.userId,

    employeeId: req.body.employeeId,
    date: req.body.date,
    status: req.body.status,

    checkIn: req.body.checkIn,
    checkOut: req.body.checkOut,

    remarks: req.body.remarks,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, attendance, "Attendance regularized successfully"),
    );
});

export const createAttendanceRegularizationController = asyncHandler(
  async (req, res) => {
    const request = await createAttendanceRegularizationRequest({
      userId: req.user.userId,
      companyId: req.user.companyId,

      date: req.body.date,
      requestedStatus: req.body.requestedStatus,

      requestedCheckIn: req.body.requestedCheckIn,

      requestedCheckOut: req.body.requestedCheckOut,

      reason: req.body.reason,
    });

    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          request,
          "Attendance regularization request submitted successfully",
        ),
      );
  },
);

export const getMyAttendanceRegularizationController = asyncHandler(
  async (req, res) => {
    const requests = await getMyAttendanceRegularizationRequests({
      userId: req.user.userId,
      companyId: req.user.companyId,
      status: req.query.status,
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          requests,
          "Attendance regularization requests fetched successfully",
        ),
      );
  },
);

export const getCompanyAttendanceRegularizationController = asyncHandler(
  async (req, res) => {
    const requests = await getCompanyAttendanceRegularizationRequests({
      companyId: req.user.companyId,
      status: req.query.status,
      employeeId: req.query.employeeId,
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          requests,
          "Attendance regularization requests fetched successfully",
        ),
      );
  },
);
