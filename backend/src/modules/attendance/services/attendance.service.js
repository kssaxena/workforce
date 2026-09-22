import mongoose from "mongoose";

import Company from "../../company/models/company.model.js";
import Employee from "../../employee/models/employee.model.js";
import Attendance from "../models/attendance.model.js";

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

  const today = new Date();

  today.setHours(0, 0, 0, 0);

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
