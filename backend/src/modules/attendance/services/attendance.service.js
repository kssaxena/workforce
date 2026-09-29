import Company from "../../company/models/company.model.js";
import Employee from "../../employee/models/employee.model.js";
import Attendance from "../models/attendance.model.js";

import ApiError from "../../../core/errors/ApiError.js";

import { getStartOfBusinessDay } from "../../../core/utils/dateTime.js";

import {
  calculateCheckInMetrics,
  calculateCheckOutMetrics,
} from "./attendanceCalculation.service.js";

import { isWithinRadius } from "./geo.service.js";

/* =========================================================
   CHECK IN
========================================================= */

export const checkIn = async ({
  userId,
  companyId,
  latitude,
  longitude,
  accuracy,
  source,
}) => {
  /*
   * -----------------------------------------
   * 1. Find employee
   * -----------------------------------------
   */

  const employee = await Employee.findOne({
    userId,
    companyId,
    isActive: true,
    employmentStatus: "ACTIVE",
  });

  if (!employee) {
    throw new ApiError(404, "Active employee profile not found");
  }

  /*
   * -----------------------------------------
   * 2. Load company configuration
   * -----------------------------------------
   */

  const company = await Company.findById(companyId).select("settings");

  if (!company) {
    throw new ApiError(404, "Company not found");
  }

  if (!company.settings?.attendanceEnabled) {
    throw new ApiError(400, "Attendance is disabled for this company");
  }

  /*
   * -----------------------------------------
   * 3. Determine timezone
   * -----------------------------------------
   */

  const timezone = company.settings?.timezone || "Asia/Kolkata";

  const checkInTimestamp = new Date();

  /*
   * -----------------------------------------
   * 4. Determine attendance metrics
   * -----------------------------------------
   */

  const metrics = await calculateCheckInMetrics({
    companyId,
    employee,
    checkInTimestamp,
    timezone,
  });

  /*
   * -----------------------------------------
   * 5. Prevent check-in on non-working day
   * -----------------------------------------
   */

  if (!metrics.isWorkingDay) {
    throw new ApiError(400, "Today is a scheduled non-working day");
  }

  /*
   * -----------------------------------------
   * 6. Determine business date
   * -----------------------------------------
   */

  const today = getStartOfBusinessDay(timezone);

  /*
   * -----------------------------------------
   * 7. Prevent duplicate check-in
   * -----------------------------------------
   */

  const existingAttendance = await Attendance.findOne({
    companyId,
    employeeId: employee._id,
    date: today,
  });

  if (existingAttendance?.checkIn?.timestamp) {
    throw new ApiError(400, "Employee has already checked in today");
  }

  /*
   * -----------------------------------------
   * 8. GPS verification
   * -----------------------------------------
   */

  let verification = "MANUAL";
  let distanceFromOffice = null;

  const gpsEnabled = company.settings?.gpsAttendanceEnabled === true;

  if (gpsEnabled) {
    const attendanceLocation = company.settings?.attendanceLocation;

    /*
     * IMPORTANT:
     * Don't use !latitude / !longitude here.
     * 0 is a valid coordinate.
     */

    if (
      attendanceLocation?.latitude === undefined ||
      attendanceLocation?.latitude === null ||
      attendanceLocation?.longitude === undefined ||
      attendanceLocation?.longitude === null
    ) {
      throw new ApiError(400, "Company attendance location is not configured");
    }

    /*
     * Employee location must also exist
     */

    if (
      latitude === undefined ||
      latitude === null ||
      longitude === undefined ||
      longitude === null
    ) {
      throw new ApiError(
        400,
        "Location coordinates are required for GPS attendance",
      );
    }

    const result = isWithinRadius({
      employeeLatitude: latitude,
      employeeLongitude: longitude,

      officeLatitude: attendanceLocation.latitude,

      officeLongitude: attendanceLocation.longitude,

      radius: company.settings?.attendanceRadius || 200,
    });

    distanceFromOffice = result.distance;

    if (!result.withinRadius) {
      throw new ApiError(
        400,
        `You are outside the allowed attendance radius. Distance: ${Math.round(
          result.distance,
        )} meters`,
      );
    }

    verification = "GPS";
  }

  /*
   * -----------------------------------------
   * 9. Create attendance
   * -----------------------------------------
   */

  const attendance = await Attendance.create({
    companyId,

    employeeId: employee._id,

    date: today,

    status: "PRESENT",

    scheduledWorkingMinutes: metrics.scheduledWorkingMinutes,

    isLate: metrics.isLate,

    lateMinutes: metrics.lateMinutes,

    checkIn: {
      timestamp: checkInTimestamp,

      location: {
        latitude,
        longitude,
        accuracy,
      },

      verification,

      distanceFromOffice,
    },

    source,

    createdBy: userId,

    updatedBy: userId,
  });

  return attendance;
};

/* =========================================================
   CHECK OUT
========================================================= */

export const checkOut = async ({
  userId,
  companyId,
  latitude,
  longitude,
  accuracy,
  source,
}) => {
  /*
   * -----------------------------------------
   * 1. Find employee
   * -----------------------------------------
   */

  const employee = await Employee.findOne({
    userId,
    companyId,
    isActive: true,
    employmentStatus: "ACTIVE",
  });

  if (!employee) {
    throw new ApiError(404, "Active employee profile not found");
  }

  /*
   * -----------------------------------------
   * 2. Load company configuration
   * -----------------------------------------
   */

  const company = await Company.findById(companyId).select("settings");

  if (!company) {
    throw new ApiError(404, "Company not found");
  }

  if (!company.settings?.attendanceEnabled) {
    throw new ApiError(400, "Attendance is disabled for this company");
  }

  /*
   * -----------------------------------------
   * 3. Determine timezone
   * -----------------------------------------
   */

  const timezone = company.settings?.timezone || "Asia/Kolkata";

  const checkOutTimestamp = new Date();

  const businessDate = getStartOfBusinessDay(timezone);

  /*
   * -----------------------------------------
   * 4. Find today's attendance
   * -----------------------------------------
   */

  const attendance = await Attendance.findOne({
    companyId,
    employeeId: employee._id,
    date: businessDate,
  });

  if (!attendance) {
    throw new ApiError(400, "No attendance record found for today");
  }

  /*
   * -----------------------------------------
   * 5. Check-in must exist
   * -----------------------------------------
   */

  if (!attendance.checkIn?.timestamp) {
    throw new ApiError(400, "Employee has not checked in today");
  }

  /*
   * -----------------------------------------
   * 6. Prevent duplicate checkout
   * -----------------------------------------
   */

  if (attendance.checkOut?.timestamp) {
    throw new ApiError(400, "Employee has already checked out today");
  }

  /*
   * -----------------------------------------
   * 7. Calculate checkout metrics
   *
   * IMPORTANT:
   * This must happen AFTER attendance
   * has been fetched because the calculation
   * requires the original check-in timestamp.
   * -----------------------------------------
   */

  const metrics = await calculateCheckOutMetrics({
    companyId,

    employee,

    checkInTimestamp: attendance.checkIn.timestamp,

    checkOutTimestamp,

    timezone,
  });

  /*
   * -----------------------------------------
   * 8. GPS verification
   * -----------------------------------------
   */

  let verification = "MANUAL";
  let distanceFromOffice = null;

  const gpsEnabled = company.settings?.gpsAttendanceEnabled === true;

  if (gpsEnabled) {
    const attendanceLocation = company.settings?.attendanceLocation;

    if (
      attendanceLocation?.latitude === undefined ||
      attendanceLocation?.latitude === null ||
      attendanceLocation?.longitude === undefined ||
      attendanceLocation?.longitude === null
    ) {
      throw new ApiError(400, "Company attendance location is not configured");
    }

    if (
      latitude === undefined ||
      latitude === null ||
      longitude === undefined ||
      longitude === null
    ) {
      throw new ApiError(
        400,
        "Location coordinates are required for GPS attendance",
      );
    }

    const result = isWithinRadius({
      employeeLatitude: latitude,
      employeeLongitude: longitude,

      officeLatitude: attendanceLocation.latitude,

      officeLongitude: attendanceLocation.longitude,

      radius: company.settings?.attendanceRadius || 200,
    });

    distanceFromOffice = result.distance;

    if (!result.withinRadius) {
      throw new ApiError(
        400,
        `You are outside the allowed attendance radius. Distance: ${Math.round(
          result.distance,
        )} meters`,
      );
    }

    verification = "GPS";
  }

  /*
   * -----------------------------------------
   * 9. Update attendance
   * -----------------------------------------
   */

  attendance.checkOut = {
    timestamp: checkOutTimestamp,

    location: {
      latitude,
      longitude,
      accuracy,
    },

    verification,

    distanceFromOffice,
  };

  attendance.totalWorkedMinutes = metrics.totalWorkedMinutes;

  attendance.scheduledWorkingMinutes = metrics.scheduledWorkingMinutes;

  attendance.isEarlyCheckout = metrics.isEarlyCheckout;

  attendance.earlyCheckoutMinutes = metrics.earlyCheckoutMinutes;

  attendance.overtimeMinutes = metrics.overtimeMinutes;

  attendance.status = metrics.status;

  attendance.source = source;

  attendance.updatedBy = userId;

  await attendance.save();

  return attendance;
};
