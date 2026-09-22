import mongoose from "mongoose";

import Company from "../../company/models/company.model.js";
import Employee from "../../employee/models/employee.model.js";
import Attendance from "../models/attendance.model.js";

import {
  getStartOfBusinessDay,
  calculateWorkedMinutes,
} from "../../../core/utils/dateTime.js";

import { isWithinRadius } from "./geo.service.js";

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
    throw new Error("Active employee profile not found");
  }

  /*
   * -----------------------------------------
   * 2. Load company configuration
   * -----------------------------------------
   */

  const company = await Company.findById(companyId).select("settings");

  if (!company) {
    throw new Error("Company not found");
  }

  if (!company.settings?.attendanceEnabled) {
    throw new Error("Attendance is disabled for this company");
  }

  /*
   * -----------------------------------------
   * 3. Determine today's date
   *
   * We will improve timezone handling
   * shortly using the company's timezone.
   * -----------------------------------------
   */

  const timezone = company.settings?.timezone || "Asia/Kolkata";

  const today = getStartOfBusinessDay(timezone);

  /*
   * -----------------------------------------
   * 4. Prevent duplicate check-in
   * -----------------------------------------
   */

  const existingAttendance = await Attendance.findOne({
    companyId,
    employeeId: employee._id,
    date: today,
  });

  if (existingAttendance?.checkIn?.timestamp) {
    throw new Error("Employee has already checked in today");
  }

  /*
   * -----------------------------------------
   * 5. GPS verification
   * -----------------------------------------
   */

  let verification = "MANUAL";
  let distanceFromOffice = null;

  if (company.settings.gpsAttendanceEnabled) {
    const attendanceLocation = company.settings.attendanceLocation;

    if (!attendanceLocation?.latitude || !attendanceLocation?.longitude) {
      throw new Error("Company attendance location is not configured");
    }

    const result = isWithinRadius({
      employeeLatitude: latitude,
      employeeLongitude: longitude,

      officeLatitude: attendanceLocation.latitude,

      officeLongitude: attendanceLocation.longitude,

      radius: company.settings.attendanceRadius,
    });

    distanceFromOffice = result.distance;

    if (!result.withinRadius) {
      throw new Error(
        `You are outside the allowed attendance radius. Distance: ${Math.round(
          result.distance,
        )} meters`,
      );
    }

    verification = "GPS";
  }

  /*
   * -----------------------------------------
   * 6. Create attendance
   * -----------------------------------------
   */

  const attendance = await Attendance.findOneAndUpdate(
    {
      companyId,
      employeeId: employee._id,
      date: today,
    },
    {
      $set: {
        status: "PRESENT",

        checkIn: {
          timestamp: new Date(),

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
      },
    },
    {
      upsert: true,
      returnDocument: "after",
    },
  );

  return attendance;
};

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
    throw new Error("Active employee profile not found");
  }

  /*
   * -----------------------------------------
   * 2. Load company configuration
   * -----------------------------------------
   */

  const company = await Company.findById(companyId).select("settings");

  if (!company) {
    throw new Error("Company not found");
  }

  if (!company.settings?.attendanceEnabled) {
    throw new Error("Attendance is disabled for this company");
  }

  /*
   * -----------------------------------------
   * 3. Get business date
   * -----------------------------------------
   */

  const timezone = company.settings?.timezone || "Asia/Kolkata";

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
    throw new Error("No attendance record found for today");
  }

  /*
   * -----------------------------------------
   * 5. Check-in must exist
   * -----------------------------------------
   */

  if (!attendance.checkIn?.timestamp) {
    throw new Error("Employee has not checked in today");
  }

  /*
   * -----------------------------------------
   * 6. Prevent duplicate checkout
   * -----------------------------------------
   */

  if (attendance.checkOut?.timestamp) {
    throw new Error("Employee has already checked out today");
  }

  /*
   * -----------------------------------------
   * 7. GPS verification
   * -----------------------------------------
   */

  let verification = "MANUAL";
  let distanceFromOffice = null;

  if (company.settings.gpsAttendanceEnabled) {
    const attendanceLocation = company.settings.attendanceLocation;

    if (
      attendanceLocation?.latitude === undefined ||
      attendanceLocation?.longitude === undefined
    ) {
      throw new Error("Company attendance location is not configured");
    }

    const result = isWithinRadius({
      employeeLatitude: latitude,
      employeeLongitude: longitude,

      officeLatitude: attendanceLocation.latitude,

      officeLongitude: attendanceLocation.longitude,

      radius: company.settings.attendanceRadius,
    });

    distanceFromOffice = result.distance;

    if (!result.withinRadius) {
      throw new Error(
        `You are outside the allowed attendance radius. Distance: ${Math.round(
          result.distance,
        )} meters`,
      );
    }

    verification = "GPS";
  }

  /*
   * -----------------------------------------
   * 8. Calculate worked duration
   * -----------------------------------------
   */

  const checkoutTimestamp = new Date();

  const totalWorkedMinutes = calculateWorkedMinutes({
    checkIn: attendance.checkIn.timestamp,

    checkOut: checkoutTimestamp,
  });

  /*
   * -----------------------------------------
   * 9. Update attendance
   * -----------------------------------------
   */

  attendance.checkOut = {
    timestamp: checkoutTimestamp,

    location: {
      latitude,
      longitude,
      accuracy,
    },

    verification,

    distanceFromOffice,
  };

  attendance.totalWorkedMinutes = totalWorkedMinutes;

  attendance.source = source;

  attendance.updatedBy = userId;

  await attendance.save();

  return attendance;
};
