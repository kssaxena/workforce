import { DateTime } from "luxon";

import Attendance from "../models/attendance.model.js";
import Employee from "../../employee/models/employee.model.js";

import { getAttendanceDashboard } from "./attendanceAdmin.service.js";

import { getEmployeeScope } from "../../organization/services/organizationScope.service.js";

/* =========================================================
   HELPERS
========================================================= */

const normalizeDate = ({ date, timezone }) => {
  const parsed = DateTime.fromISO(date, {
    zone: timezone,
  });

  if (!parsed.isValid) {
    throw new Error("Invalid report date");
  }

  return parsed;
};

const getStatusCounts = (employees = []) => {
  const counts = {
    total: employees.length,

    present: 0,
    absent: 0,
    halfDay: 0,
    onLeave: 0,
    holiday: 0,
    weekOff: 0,

    late: 0,
    checkedOut: 0,

    totalWorkedMinutes: 0,
    totalScheduledMinutes: 0,
    totalOvertimeMinutes: 0,
    totalLateMinutes: 0,
    totalEarlyCheckoutMinutes: 0,
  };

  employees.forEach((employee) => {
    const status = employee.status;

    switch (status) {
      case "PRESENT":
        counts.present += 1;
        break;

      case "ABSENT":
        counts.absent += 1;
        break;

      case "HALF_DAY":
        counts.halfDay += 1;
        break;

      case "ON_LEAVE":
        counts.onLeave += 1;
        break;

      case "HOLIDAY":
        counts.holiday += 1;
        break;

      case "WEEK_OFF":
        counts.weekOff += 1;
        break;

      default:
        break;
    }

    if (employee.isLate) {
      counts.late += 1;
    }

    if (employee.checkOut?.timestamp) {
      counts.checkedOut += 1;
    }

    counts.totalWorkedMinutes += Number(employee.totalWorkedMinutes || 0);

    counts.totalScheduledMinutes += Number(
      employee.scheduledWorkingMinutes || 0,
    );

    counts.totalOvertimeMinutes += Number(employee.overtimeMinutes || 0);

    counts.totalLateMinutes += Number(employee.lateMinutes || 0);

    counts.totalEarlyCheckoutMinutes += Number(
      employee.earlyCheckoutMinutes || 0,
    );
  });

  const scheduledEmployees = counts.total - counts.holiday - counts.weekOff;

  const attendanceRate =
    scheduledEmployees > 0
      ? Number(
          (
            ((counts.present + counts.halfDay * 0.5) / scheduledEmployees) *
            100
          ).toFixed(2),
        )
      : 0;

  return {
    ...counts,
    scheduledEmployees,
    attendanceRate,
  };
};

/* =========================================================
   DAILY REPORT
========================================================= */

export const getDailyAttendanceReport = async ({
  userId,
  companyId,
  date,
  departmentId,
  organizationUnitId,
  employmentStatus,
  status,
  search,
  timezone,
}) => {
  const reportDate = normalizeDate({
    date,
    timezone,
  });

  const businessDate = reportDate.toFormat("yyyy-MM-dd");

  const dashboard = await getAttendanceDashboard({
    userId,
    companyId,

    date: businessDate,

    departmentId,
    organizationUnitId,
    employmentStatus,
    status,
    search,

    timezone,
  });

  const summary = getStatusCounts(dashboard.employees);

  return {
    reportType: "DAILY",

    date: businessDate,

    timezone,

    holiday: dashboard.holiday || null,

    summary,

    employees: dashboard.employees,
  };
};

/* =========================================================
   MONTHLY REPORT
========================================================= */

export const getMonthlyAttendanceReport = async ({
  userId,
  companyId,
  month,
  departmentId,
  organizationUnitId,
  employmentStatus,
  search,
  timezone,
}) => {
  const parsedMonth = DateTime.fromFormat(month, "yyyy-MM", {
    zone: timezone,
  });

  if (!parsedMonth.isValid) {
    throw new Error("Invalid report month. Expected YYYY-MM");
  }

  const startOfMonth = parsedMonth.startOf("month");

  const endOfMonth = parsedMonth.endOf("month");

  const dailyReports = [];

  let currentDate = startOfMonth;

  while (currentDate <= endOfMonth) {
    const businessDate = currentDate.toFormat("yyyy-MM-dd");

    const dashboard = await getAttendanceDashboard({
      userId,
      companyId,

      date: businessDate,

      departmentId,
      organizationUnitId,
      employmentStatus,
      search,

      timezone,
    });

    const summary = getStatusCounts(dashboard.employees);

    dailyReports.push({
      date: businessDate,

      holiday: dashboard.holiday || null,

      summary,
    });

    currentDate = currentDate.plus({
      days: 1,
    });
  }

  /* -----------------------------------------
       Monthly totals
    ----------------------------------------- */

  const monthly = {
    totalWorkingDays: 0,

    totalEmployeeDays: 0,

    present: 0,
    absent: 0,
    halfDay: 0,
    onLeave: 0,
    holiday: 0,
    weekOff: 0,

    late: 0,
    checkedOut: 0,

    totalWorkedMinutes: 0,
    totalScheduledMinutes: 0,
    totalOvertimeMinutes: 0,
    totalLateMinutes: 0,
    totalEarlyCheckoutMinutes: 0,
  };

  dailyReports.forEach((day) => {
    const summary = day.summary;

    monthly.totalEmployeeDays += summary.total;

    monthly.present += summary.present;

    monthly.absent += summary.absent;

    monthly.halfDay += summary.halfDay;

    monthly.onLeave += summary.onLeave;

    monthly.holiday += summary.holiday;

    monthly.weekOff += summary.weekOff;

    monthly.late += summary.late;

    monthly.checkedOut += summary.checkedOut;

    monthly.totalWorkedMinutes += summary.totalWorkedMinutes;

    monthly.totalScheduledMinutes += summary.totalScheduledMinutes;

    monthly.totalOvertimeMinutes += summary.totalOvertimeMinutes;

    monthly.totalLateMinutes += summary.totalLateMinutes;

    monthly.totalEarlyCheckoutMinutes += summary.totalEarlyCheckoutMinutes;

    if (summary.scheduledEmployees > 0) {
      monthly.totalWorkingDays += 1;
    }
  });

  const scheduledDays = monthly.present + monthly.absent + monthly.halfDay;

  const attendanceRate =
    scheduledDays > 0
      ? Number(
          (
            ((monthly.present + monthly.halfDay * 0.5) / scheduledDays) *
            100
          ).toFixed(2),
        )
      : 0;

  return {
    reportType: "MONTHLY",

    month: parsedMonth.toFormat("yyyy-MM"),

    timezone,

    summary: {
      ...monthly,

      scheduledDays,

      attendanceRate,
    },

    daily: dailyReports,
  };
};
