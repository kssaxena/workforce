// src/modules/dashboard/services/dashboard.service.js

import Company from "../../company/models/company.model.js";
import Employee from "../../employee/models/employee.model.js";
import Attendance from "../../attendance/models/attendance.model.js";

import { getEmployeeScope } from "../../organization/services/organizationScope.service.js";

import {
  getStartOfBusinessDay,
  getEndOfBusinessDay,
} from "../../../core/utils/dateTime.js";

import ApiError from "../../../core/errors/ApiError.js";

export const getDashboardOverview = async ({ userId, companyId }) => {
  /*
   * ----------------------------------------------------
   * 1. Load company + employee visibility scope
   * ----------------------------------------------------
   */

  const [company, scope] = await Promise.all([
    Company.findById(companyId).select(
      "name legalName status settings subscription",
    ),

    getEmployeeScope({
      userId,
      companyId,
    }),
  ]);

  if (!company) {
    throw new ApiError(404, "Company not found");
  }

  /*
   * ----------------------------------------------------
   * 2. Employee query
   * ----------------------------------------------------
   */

  const employeeQuery = {
    companyId,
    isActive: true,
  };

  /*
   * SUPER_ADMIN / HR_ADMIN
   * -> employeeIds === null
   *
   * Manager / Team Leader
   * -> employeeIds contains visible employees
   *
   * Employee
   * -> employeeIds contains only themselves
   */

  if (scope.employeeIds !== null) {
    employeeQuery._id = {
      $in: scope.employeeIds,
    };
  }

  const employees = await Employee.find(employeeQuery)
    .select(
      "_id employeeCode firstName lastName designation departmentId organizationUnitId employmentStatus",
    )
    .populate("departmentId", "name code")
    .sort({
      firstName: 1,
      lastName: 1,
    })
    .lean();

  /*
   * ----------------------------------------------------
   * 3. Today's business date
   * ----------------------------------------------------
   */

  const timezone = company.settings?.timezone || "Asia/Kolkata";

  const startOfDay = getStartOfBusinessDay(timezone);
  const endOfDay = getEndOfBusinessDay(timezone);

  /*
   * ----------------------------------------------------
   * 4. Today's attendance
   * ----------------------------------------------------
   */

  const attendanceQuery = {
    companyId,

    date: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
  };

  if (scope.employeeIds !== null) {
    attendanceQuery.employeeId = {
      $in: scope.employeeIds,
    };
  }

  const attendance = await Attendance.find(attendanceQuery)
    .select(
      [
        "employeeId",
        "status",
        "checkIn",
        "checkOut",
        "totalWorkedMinutes",
        "isLate",
        "lateMinutes",
        "overtimeMinutes",
        "createdAt",
        "updatedAt",
      ].join(" "),
    )
    .populate("employeeId", "employeeCode firstName lastName designation")
    .sort({
      updatedAt: -1,
    })
    .lean();

  /*
   * ----------------------------------------------------
   * 5. Attendance map
   * ----------------------------------------------------
   */

  const attendanceByEmployee = new Map(
    attendance.map((record) => [record.employeeId?._id?.toString(), record]),
  );

  /*
   * ----------------------------------------------------
   * 6. Employee statistics
   * ----------------------------------------------------
   */

  const totalEmployees = employees.length;

  const activeEmployees = employees.filter(
    (employee) => employee.employmentStatus === "ACTIVE",
  ).length;

  const onLeaveEmployees = employees.filter(
    (employee) => employee.employmentStatus === "ON_LEAVE",
  ).length;

  const otherEmployees = employees.filter(
    (employee) => !["ACTIVE", "ON_LEAVE"].includes(employee.employmentStatus),
  ).length;

  /*
   * ----------------------------------------------------
   * 7. Attendance statistics
   * ----------------------------------------------------
   */

  const present = attendance.filter(
    (record) => record.status === "PRESENT",
  ).length;

  const halfDay = attendance.filter(
    (record) => record.status === "HALF_DAY",
  ).length;

  const absent = attendance.filter(
    (record) => record.status === "ABSENT",
  ).length;

  const attendanceOnLeave = attendance.filter(
    (record) => record.status === "ON_LEAVE",
  ).length;

  const onLeave = Math.max(onLeaveEmployees, attendanceOnLeave);

  const late = attendance.filter((record) => record.isLate === true).length;

  const checkedIn = attendance.filter((record) =>
    Boolean(record.checkIn?.timestamp),
  ).length;

  const checkedOut = attendance.filter((record) =>
    Boolean(record.checkOut?.timestamp),
  ).length;

  /*
   * ----------------------------------------------------
   * 8. Employees who haven't marked attendance
   * ----------------------------------------------------
   */

  const markedEmployees = new Set(
    attendance
      .map((record) => record.employeeId?._id?.toString())
      .filter(Boolean),
  );

  const notMarked = Math.max(0, totalEmployees - markedEmployees.size);

  /*
   * ----------------------------------------------------
   * 9. Attendance rate
   * ----------------------------------------------------
   */

  const attendanceRateBase = Math.max(0, totalEmployees - onLeave);

  const attendanceRate = attendanceRateBase
    ? Number(((present / attendanceRateBase) * 100).toFixed(1))
    : 0;

  /*
   * ----------------------------------------------------
   * 10. Department statistics
   * ----------------------------------------------------
   */

  const departmentMap = new Map();

  for (const employee of employees) {
    const departmentName = employee.departmentId?.name || "Unassigned";

    if (!departmentMap.has(departmentName)) {
      departmentMap.set(departmentName, {
        name: departmentName,
        employees: 0,
        present: 0,
        absent: 0,
      });
    }

    const department = departmentMap.get(departmentName);

    department.employees += 1;

    const employeeAttendance = attendanceByEmployee.get(
      employee._id.toString(),
    );

    if (employeeAttendance?.status === "PRESENT") {
      department.present += 1;
    }

    if (employeeAttendance?.status === "ABSENT") {
      department.absent += 1;
    }
  }

  const departments = [...departmentMap.values()].sort(
    (a, b) => b.employees - a.employees,
  );

  /*
   * ----------------------------------------------------
   * 11. Recent activity
   * ----------------------------------------------------
   */

  const recentActivity = attendance.slice(0, 8).map((record) => ({
    id: record._id,

    employee: record.employeeId
      ? {
          id: record.employeeId._id,

          employeeCode: record.employeeId.employeeCode,

          name: [record.employeeId.firstName, record.employeeId.lastName]
            .filter(Boolean)
            .join(" "),

          designation: record.employeeId.designation || null,
        }
      : null,

    status: record.status,

    checkIn: record.checkIn?.timestamp || null,

    checkOut: record.checkOut?.timestamp || null,

    isLate: record.isLate,

    lateMinutes: record.lateMinutes,

    updatedAt: record.updatedAt,
  }));

  /*
   * ----------------------------------------------------
   * 12. Final dashboard response
   * ----------------------------------------------------
   */

  return {
    company: {
      id: company._id,

      name: company.name,

      legalName: company.legalName,

      status: company.status,

      timezone,

      currency: company.settings?.currency || "INR",

      attendanceEnabled: company.settings?.attendanceEnabled === true,

      gpsAttendanceEnabled: company.settings?.gpsAttendanceEnabled === true,

      subscription: company.subscription || null,
    },

    employees: {
      total: totalEmployees,

      active: activeEmployees,

      onLeave,

      other: otherEmployees,
    },

    attendance: {
      present,

      halfDay,

      absent,

      onLeave,

      late,

      checkedIn,

      checkedOut,

      notMarked,

      attendanceRate,

      recorded: attendance.length,
    },

    /*
     * These modules are not implemented
     * in the current backend yet.
     */
    fieldWorkforce: {
      available: false,

      active: null,

      outsideRadius: null,

      reason:
        "Field workforce tracking is not yet available in the current backend modules.",
    },

    payroll: {
      available: false,

      reason:
        "Payroll module is not yet available in the current backend modules.",
    },

    departments,

    recentActivity,
  };
};
