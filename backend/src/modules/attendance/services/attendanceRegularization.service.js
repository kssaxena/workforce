import mongoose from "mongoose";
import Attendance from "../models/attendance.model.js";
import Employee from "../../employee/models/employee.model.js";
import Company from "../../company/models/company.model.js";
import ApiError from "../../../core/errors/ApiError.js";
import {
  getStartOfBusinessDay,
  calculateWorkedMinutes,
} from "../../../core/utils/dateTime.js";

const ALLOWED_STATUSES = [
  "PRESENT",
  "ABSENT",
  "HALF_DAY",
  "ON_LEAVE",
  "HOLIDAY",
  "WEEK_OFF",
];

const createBusinessDate = ({ date, timezone }) => {
  const [year, month, day] = date.split("-").map(Number);

  const businessDate = new Date(Date.UTC(year, month - 1, day));

  /*
   * The attendance model stores the start of the business day.
   *
   * We therefore compare the supplied calendar date against
   * the company's timezone-aware business date rather than
   * treating the browser's local timezone as authoritative.
   */
  if (Number.isNaN(businessDate.getTime())) {
    throw new ApiError(400, "Invalid attendance date");
  }

  return businessDate;
};

const validateDateOrder = ({ checkIn, checkOut }) => {
  if (!checkIn || !checkOut) {
    return;
  }

  if (new Date(checkOut) <= new Date(checkIn)) {
    throw new ApiError(400, "Check-out time must be later than check-in time");
  }
};

export const regularizeAttendance = async ({
  companyId,
  updatedBy,
  employeeId,
  date,
  status,
  checkIn,
  checkOut,
  remarks,
}) => {
  if (!mongoose.Types.ObjectId.isValid(employeeId)) {
    throw new ApiError(400, "Invalid employee ID");
  }

  const company = await Company.findById(companyId).select("settings.timezone");

  if (!company) {
    throw new ApiError(404, "Company not found");
  }

  const timezone = company.settings?.timezone || "Asia/Kolkata";

  const employee = await Employee.findOne({
    _id: employeeId,
    companyId,
    isActive: true,
  }).select("_id employeeCode firstName lastName designation");

  if (!employee) {
    throw new ApiError(404, "Employee not found for this company");
  }

  if (!ALLOWED_STATUSES.includes(status)) {
    throw new ApiError(400, "Invalid attendance status");
  }

  validateDateOrder({
    checkIn,
    checkOut,
  });

  /*
   * Attendance dates are stored as business-day values.
   *
   * We construct the selected calendar date independently of
   * the browser's timezone.
   */
  const attendanceDate = createBusinessDate({
    date,
    timezone,
  });

  /*
   * Non-working statuses should not accidentally retain
   * working-time information.
   */
  const isWorkingStatus = status === "PRESENT" || status === "HALF_DAY";

  const finalCheckIn = isWorkingStatus
    ? checkIn
      ? new Date(checkIn)
      : null
    : null;

  const finalCheckOut = isWorkingStatus
    ? checkOut
      ? new Date(checkOut)
      : null
    : null;

  const totalWorkedMinutes = calculateWorkedMinutes({
    checkIn: finalCheckIn,
    checkOut: finalCheckOut,
  });

  /*
   * Manual regularization deliberately uses ADMIN as the source.
   *
   * We also mark the verification as MANUAL because these values
   * were entered/corrected by HR/Admin rather than verified by GPS.
   */
  const updateData = {
    status,

    checkIn: {
      timestamp: finalCheckIn,
      location: undefined,
      verification: finalCheckIn ? "MANUAL" : undefined,
      distanceFromOffice: undefined,
    },

    checkOut: {
      timestamp: finalCheckOut,
      location: undefined,
      verification: finalCheckOut ? "MANUAL" : undefined,
      distanceFromOffice: undefined,
    },

    totalWorkedMinutes,

    remarks: remarks || "",

    source: "ADMIN",

    updatedBy,

    /*
     * Regularization currently does not attempt to fabricate
     * schedule-derived late/early/overtime calculations.
     *
     * Existing values are reset because the attendance has
     * been manually corrected.
     */
    isLate: false,
    lateMinutes: 0,

    isEarlyCheckout: false,
    earlyCheckoutMinutes: 0,

    overtimeMinutes: 0,
  };

  /*
   * For statuses such as ABSENT / ON_LEAVE / HOLIDAY / WEEK_OFF,
   * there should be no working-time values.
   */
  if (!isWorkingStatus) {
    updateData.totalWorkedMinutes = 0;
  }

  const attendance = await Attendance.findOneAndUpdate(
    {
      companyId,
      employeeId,
      date: attendanceDate,
    },
    {
      $set: updateData,
      $setOnInsert: {
        companyId,
        employeeId,
        date: attendanceDate,
        createdBy: updatedBy,
      },
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
    },
  ).populate(
    "employeeId",
    "employeeCode firstName lastName designation departmentId organizationUnitId",
  );

  return attendance;
};
