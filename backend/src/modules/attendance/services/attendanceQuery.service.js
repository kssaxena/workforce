import { getStartOfBusinessDay } from "../../../core/utils/dateTime.js";
import Attendance from "../models/attendance.model.js";

export const getEmployeeAttendance = async ({
  employeeId,
  companyId,
  startDate,
  endDate,
}) => {
  const query = {
    companyId,
    employeeId,
  };

  if (startDate || endDate) {
    query.date = {};

    if (startDate) {
      query.date.$gte = new Date(startDate);
    }

    if (endDate) {
      query.date.$lte = new Date(endDate);
    }
  }

  return Attendance.find(query)
    .populate("employeeId", "employeeCode firstName lastName designation")
    .sort({
      date: -1,
    });
};

export const getTodayAttendance = async ({
  employeeId,
  companyId,
  timezone,
}) => {
  const date = getStartOfBusinessDay(timezone);

  return Attendance.findOne({
    companyId,
    employeeId,
    date,
  }).populate("employeeId", "employeeCode firstName lastName designation");
};
