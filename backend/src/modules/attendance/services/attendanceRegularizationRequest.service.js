import mongoose from "mongoose";

import Attendance from "../models/attendance.model.js";
import AttendanceRegularization from "../models/attendanceRegularization.model.js";
import Employee from "../../employee/models/employee.model.js";
import Company from "../../company/models/company.model.js";

import ApiError from "../../../core/errors/ApiError.js";

const createBusinessDate = (date) => {
  const [year, month, day] = date.split("-").map(Number);

  const result = new Date(Date.UTC(year, month - 1, day));

  if (Number.isNaN(result.getTime())) {
    throw new ApiError(400, "Invalid attendance date");
  }

  return result;
};

const validateTimeRange = ({ requestedCheckIn, requestedCheckOut }) => {
  if (
    requestedCheckIn &&
    requestedCheckOut &&
    new Date(requestedCheckOut) <= new Date(requestedCheckIn)
  ) {
    throw new ApiError(400, "Check-out must be later than check-in");
  }
};

export const createAttendanceRegularizationRequest = async ({
  userId,
  companyId,
  date,
  requestedStatus,
  requestedCheckIn,
  requestedCheckOut,
  reason,
}) => {
  const employee = await Employee.findOne({
    userId,
    companyId,
    isActive: true,
  }).select("_id employeeCode firstName lastName");

  if (!employee) {
    throw new ApiError(404, "Employee profile not found");
  }

  const company = await Company.findById(companyId).select("settings.timezone");

  if (!company) {
    throw new ApiError(404, "Company not found");
  }

  validateTimeRange({
    requestedCheckIn,
    requestedCheckOut,
  });

  const attendanceDate = createBusinessDate(date);

  /*
   * Prevent multiple active requests for the same
   * employee/date combination.
   */
  const existingRequest = await AttendanceRegularization.findOne({
    companyId,
    employeeId: employee._id,
    date: attendanceDate,
    status: "PENDING",
  });

  if (existingRequest) {
    throw new ApiError(
      409,
      "A pending regularization request already exists for this date",
    );
  }

  /*
   * If attendance already exists, keep its reference.
   * If it doesn't exist, the reference remains null and
   * approval will create the attendance record.
   */
  const attendance = await Attendance.findOne({
    companyId,
    employeeId: employee._id,
    date: attendanceDate,
  }).select("_id");

  const request = await AttendanceRegularization.create({
    companyId,
    employeeId: employee._id,

    attendanceId: attendance?._id || null,

    date: attendanceDate,

    requestedStatus,

    requestedCheckIn: requestedCheckIn ? new Date(requestedCheckIn) : null,

    requestedCheckOut: requestedCheckOut ? new Date(requestedCheckOut) : null,

    reason,

    status: "PENDING",

    createdBy: userId,
    updatedBy: userId,
  });

  return AttendanceRegularization.findById(request._id)
    .populate("employeeId", "employeeCode firstName lastName designation")
    .populate(
      "attendanceId",
      "date status checkIn checkOut totalWorkedMinutes",
    );
};

export const getMyAttendanceRegularizationRequests = async ({
  userId,
  companyId,
  status,
}) => {
  const employee = await Employee.findOne({
    userId,
    companyId,
    isActive: true,
  }).select("_id");

  if (!employee) {
    throw new ApiError(404, "Employee profile not found");
  }

  const query = {
    companyId,
    employeeId: employee._id,
  };

  if (status) {
    query.status = status;
  }

  return AttendanceRegularization.find(query)
    .populate("attendanceId", "date status checkIn checkOut totalWorkedMinutes")
    .populate("reviewedBy", "email")
    .sort({
      createdAt: -1,
    });
};

export const getCompanyAttendanceRegularizationRequests = async ({
  companyId,
  status,
  employeeId,
}) => {
  const query = {
    companyId,
  };

  if (status) {
    query.status = status;
  }

  if (employeeId) {
    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      throw new ApiError(400, "Invalid employee ID");
    }

    query.employeeId = employeeId;
  }

  return AttendanceRegularization.find(query)
    .populate(
      "employeeId",
      "employeeCode firstName lastName designation departmentId organizationUnitId",
    )
    .populate("attendanceId", "date status checkIn checkOut totalWorkedMinutes")
    .populate("reviewedBy", "email")
    .sort({
      status: 1,
      createdAt: -1,
    });
};
