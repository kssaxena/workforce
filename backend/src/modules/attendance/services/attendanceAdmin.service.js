import { DateTime } from "luxon";

import Attendance from "../models/attendance.model.js";
import { WorkSchedule } from "../models/workSchedule.model.js";

import Employee from "../../employee/models/employee.model.js";

import { getEmployeeScope } from "../../organization/services/organizationScope.service.js";

import { getHolidayForDate } from "../../holiday/services/holiday.service.js";

import { isEmployeeOnApprovedLeave } from "../../leave/services/leave.service.js";

/* =========================================================
   HELPERS
========================================================= */

/**
 * Get the employee's assigned work schedule.
 *
 * Priority:
 * 1. Employee-specific schedule
 * 2. Company default schedule
 * 3. null
 */
const getScheduleForEmployee = ({
  employee,
  schedulesById,
  defaultSchedule,
}) => {
  if (employee.workScheduleId) {
    const schedule = schedulesById.get(employee.workScheduleId.toString());

    if (schedule) {
      return schedule;
    }
  }

  return defaultSchedule || null;
};

/**
 * Calculate scheduled working minutes for a particular day.
 *
 * Example:
 * 09:00 → 18:00
 * Break = 60 minutes
 *
 * Result = 480 minutes
 */
const calculateScheduledMinutes = (scheduleDay) => {
  if (!scheduleDay?.isWorkingDay) {
    return 0;
  }

  if (!scheduleDay.startTime || !scheduleDay.endTime) {
    return 0;
  }

  const [startHour, startMinute] = scheduleDay.startTime.split(":").map(Number);

  const [endHour, endMinute] = scheduleDay.endTime.split(":").map(Number);

  const startTotal = startHour * 60 + startMinute;
  const endTotal = endHour * 60 + endMinute;

  let duration = endTotal - startTotal;

  /*
   * Overnight schedule.
   *
   * Example:
   * 22:00 → 06:00
   */
  if (duration < 0) {
    duration += 24 * 60;
  }

  return Math.max(0, duration - (scheduleDay.breakMinutes || 0));
};

/**
 * Get the schedule configuration for the selected day.
 *
 * WorkSchedule:
 *
 * Sunday    = 0
 * Monday    = 1
 * Tuesday   = 2
 * Wednesday = 3
 * Thursday  = 4
 * Friday    = 5
 * Saturday  = 6
 *
 * Luxon:
 *
 * Monday    = 1
 * ...
 * Sunday    = 7
 *
 * Therefore:
 *
 * Sunday 7 % 7 = 0
 */
const getScheduleDay = (schedule, businessDate) => {
  if (!schedule?.days?.length) {
    return null;
  }

  const dayOfWeek = businessDate.weekday % 7;

  return schedule.days.find((day) => day.dayOfWeek === dayOfWeek) || null;
};

/**
 * Normalize a MongoDB attendance document into a safe
 * response object.
 */
const formatAttendance = (attendance) => {
  if (!attendance) {
    return null;
  }

  return {
    _id: attendance._id,

    status: attendance.status,

    date: attendance.date,

    checkIn: attendance.checkIn || null,

    checkOut: attendance.checkOut || null,

    totalWorkedMinutes: attendance.totalWorkedMinutes || 0,

    scheduledWorkingMinutes: attendance.scheduledWorkingMinutes || 0,

    lateMinutes: attendance.lateMinutes || 0,

    isLate: attendance.isLate || false,

    earlyCheckoutMinutes: attendance.earlyCheckoutMinutes || 0,

    isEarlyCheckout: attendance.isEarlyCheckout || false,

    overtimeMinutes: attendance.overtimeMinutes || 0,

    remarks: attendance.remarks || null,

    source: attendance.source || null,

    createdBy: attendance.createdBy || null,

    updatedBy: attendance.updatedBy || null,

    createdAt: attendance.createdAt || null,

    updatedAt: attendance.updatedAt || null,
  };
};

/* =========================================================
   ADMIN ATTENDANCE DASHBOARD
========================================================= */

export const getAttendanceDashboard = async ({
  userId,
  companyId,

  date,

  departmentId,
  organizationUnitId,
  employmentStatus,

  status,
  search,

  timezone = "Asia/Kolkata",
}) => {
  /*
   * -------------------------------------------------------
   * 1. Validate / determine business date
   * -------------------------------------------------------
   */

  const businessDate = date
    ? DateTime.fromISO(date, {
        zone: timezone,
      })
    : DateTime.now().setZone(timezone);

  if (!businessDate.isValid) {
    throw new Error("Invalid attendance date");
  }

  const startOfDay = businessDate.startOf("day").toJSDate();

  const endOfDay = businessDate.endOf("day").toJSDate();

  /*
   * -------------------------------------------------------
   * 2. Determine employee visibility scope
   * -------------------------------------------------------
   */

  const scope = await getEmployeeScope({
    userId,
    companyId,
  });

  /*
   * -------------------------------------------------------
   * 3. Build employee query
   * -------------------------------------------------------
   */

  const employeeQuery = {
    companyId,
    isActive: true,
  };

  if (scope.employeeIds !== null) {
    employeeQuery._id = {
      $in: scope.employeeIds,
    };
  }

  if (departmentId) {
    employeeQuery.departmentId = departmentId;
  }

  if (organizationUnitId) {
    employeeQuery.organizationUnitId = organizationUnitId;
  }

  if (employmentStatus) {
    employeeQuery.employmentStatus = employmentStatus;
  }

  if (search?.trim()) {
    const searchRegex = new RegExp(search.trim(), "i");

    employeeQuery.$or = [
      {
        employeeCode: searchRegex,
      },
      {
        firstName: searchRegex,
      },
      {
        lastName: searchRegex,
      },
      {
        designation: searchRegex,
      },
    ];
  }

  /*
   * -------------------------------------------------------
   * 4. Fetch employees
   * -------------------------------------------------------
   */

  const employees = await Employee.find(employeeQuery)
    .populate("departmentId", "name code")
    .populate("organizationUnitId", "name code level")
    .populate("reportsTo", "employeeCode firstName lastName designation")
    .select(
      [
        "_id",
        "employeeCode",
        "firstName",
        "lastName",
        "designation",
        "departmentId",
        "organizationUnitId",
        "reportsTo",
        "workScheduleId",
        "employmentStatus",
      ].join(" "),
    )
    .sort({
      firstName: 1,
      lastName: 1,
    })
    .lean();

  /*
   * -------------------------------------------------------
   * 5. Fetch relevant work schedules
   * -------------------------------------------------------
   */

  const scheduleIds = [
    ...new Set(
      employees
        .map((employee) =>
          employee.workScheduleId ? employee.workScheduleId.toString() : null,
        )
        .filter(Boolean),
    ),
  ];

  const scheduleConditions = [];

  if (scheduleIds.length > 0) {
    scheduleConditions.push({
      _id: {
        $in: scheduleIds,
      },
    });
  }

  scheduleConditions.push({
    isDefault: true,
  });

  const schedules = await WorkSchedule.find({
    companyId,
    isActive: true,
    $or: scheduleConditions,
  })
    .select("_id name code days isDefault")
    .lean();

  const schedulesById = new Map(
    schedules.map((schedule) => [schedule._id.toString(), schedule]),
  );

  const defaultSchedule =
    schedules.find((schedule) => schedule.isDefault) || null;

  /*
   * -------------------------------------------------------
   * 6. Determine company holiday
   * -------------------------------------------------------
   */

  const holiday = await getHolidayForDate({
    companyId,
    date: startOfDay,
    timezone,
  });

  const isCompanyHoliday = Boolean(holiday) && holiday.isOptional !== true;

  /*
   * -------------------------------------------------------
   * 7. Fetch attendance records
   * -------------------------------------------------------
   */

  const attendanceRecords = await Attendance.find({
    companyId,
    employeeId: {
      $in: employees.map((employee) => employee._id),
    },
    date: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
  })
    .populate("employeeId", "employeeCode firstName lastName designation")
    .sort({
      "checkIn.timestamp": 1,
    })
    .lean();

  /*
   * -------------------------------------------------------
   * 8. Map attendance by employee
   * -------------------------------------------------------
   */

  const attendanceByEmployee = new Map();

  for (const attendance of attendanceRecords) {
    attendanceByEmployee.set(attendance.employeeId._id.toString(), attendance);
  }

  /*
   * -------------------------------------------------------
   * 9. Build employee attendance rows
   * -------------------------------------------------------
   */

  const rows = await Promise.all(
    employees.map(async (employee) => {
      const employeeId = employee._id.toString();

      const attendance = attendanceByEmployee.get(employeeId);

      /*
       * Employee schedule.
       */
      const schedule = getScheduleForEmployee({
        employee,
        schedulesById,
        defaultSchedule,
      });

      /*
       * Today's schedule.
       */
      const scheduleDay = getScheduleDay(schedule, businessDate);

      /*
       * Is this a scheduled working day?
       */
      const isWorkingDay = scheduleDay?.isWorkingDay === true;

      /*
       * ---------------------------------------------------
       * Approved leave
       * ---------------------------------------------------
       */

      let approvedLeave = null;

      if (!attendance && isWorkingDay && !isCompanyHoliday) {
        approvedLeave = await isEmployeeOnApprovedLeave({
          companyId,
          employeeId: employee._id,
          date: startOfDay,
          timezone,
        });
      }

      /*
       * ---------------------------------------------------
       * Determine effective status
       * ---------------------------------------------------
       */

      let effectiveStatus;

      if (attendance) {
        effectiveStatus = attendance.status;
      } else if (isCompanyHoliday) {
        effectiveStatus = "HOLIDAY";
      } else if (approvedLeave) {
        effectiveStatus = "ON_LEAVE";
      } else if (!isWorkingDay) {
        effectiveStatus = "WEEK_OFF";
      } else {
        effectiveStatus = "ABSENT";
      }

      /*
       * ---------------------------------------------------
       * Attendance fallback
       * ---------------------------------------------------
       */

      const attendanceData = attendance || {
        status: effectiveStatus,

        checkIn: null,
        checkOut: null,

        totalWorkedMinutes: 0,

        scheduledWorkingMinutes: calculateScheduledMinutes(scheduleDay),

        lateMinutes: 0,
        isLate: false,

        earlyCheckoutMinutes: 0,
        isEarlyCheckout: false,

        overtimeMinutes: 0,

        remarks: null,

        source: "SYSTEM",
      };

      /*
       * ---------------------------------------------------
       * Return row
       * ---------------------------------------------------
       */

      return {
        employee: {
          _id: employee._id,

          employeeCode: employee.employeeCode,

          firstName: employee.firstName,

          lastName: employee.lastName,

          designation: employee.designation,

          employmentStatus: employee.employmentStatus,
        },

        department: employee.departmentId
          ? {
              _id: employee.departmentId._id,

              name: employee.departmentId.name,

              code: employee.departmentId.code,
            }
          : null,

        organizationUnit: employee.organizationUnitId
          ? {
              _id: employee.organizationUnitId._id,

              name: employee.organizationUnitId.name,

              code: employee.organizationUnitId.code,

              level: employee.organizationUnitId.level,
            }
          : null,

        reportsTo: employee.reportsTo
          ? {
              _id: employee.reportsTo._id,

              employeeCode: employee.reportsTo.employeeCode,

              firstName: employee.reportsTo.firstName,

              lastName: employee.reportsTo.lastName,

              designation: employee.reportsTo.designation,
            }
          : null,

        schedule: schedule
          ? {
              _id: schedule._id,

              name: schedule.name,

              code: schedule.code,

              isDefault: schedule.isDefault,

              day: scheduleDay
                ? {
                    dayOfWeek: scheduleDay.dayOfWeek,

                    isWorkingDay: scheduleDay.isWorkingDay,

                    startTime: scheduleDay.startTime,

                    endTime: scheduleDay.endTime,

                    breakMinutes: scheduleDay.breakMinutes,

                    scheduledWorkingMinutes:
                      calculateScheduledMinutes(scheduleDay),
                  }
                : null,
            }
          : null,

        attendance: {
          _id: attendance?._id || null,

          status: attendanceData.status,

          checkIn: attendanceData.checkIn || null,

          checkOut: attendanceData.checkOut || null,

          totalWorkedMinutes: attendanceData.totalWorkedMinutes || 0,

          scheduledWorkingMinutes: attendanceData.scheduledWorkingMinutes || 0,

          lateMinutes: attendanceData.lateMinutes || 0,

          isLate: attendanceData.isLate || false,

          earlyCheckoutMinutes: attendanceData.earlyCheckoutMinutes || 0,

          isEarlyCheckout: attendanceData.isEarlyCheckout || false,

          overtimeMinutes: attendanceData.overtimeMinutes || 0,

          remarks: attendanceData.remarks || null,

          source: attendanceData.source || "SYSTEM",
        },

        meta: {
          hasAttendance: Boolean(attendance),

          isWorkingDay,

          isCompanyHoliday,

          isOnApprovedLeave: Boolean(approvedLeave),

          isScheduled: Boolean(schedule),

          isDefaultSchedule: Boolean(schedule?.isDefault),
        },
      };
    }),
  );

  /*
   * -------------------------------------------------------
   * 10. Apply status filter
   * -------------------------------------------------------
   */

  const filteredRows = status
    ? rows.filter((row) => row.attendance.status === status)
    : rows;

  /*
   * -------------------------------------------------------
   * 11. Statistics
   * -------------------------------------------------------
   */

  const totalEmployees = rows.length;

  const present = rows.filter(
    (row) => row.attendance.status === "PRESENT",
  ).length;

  const absent = rows.filter(
    (row) => row.attendance.status === "ABSENT",
  ).length;

  const halfDay = rows.filter(
    (row) => row.attendance.status === "HALF_DAY",
  ).length;

  const onLeave = rows.filter(
    (row) => row.attendance.status === "ON_LEAVE",
  ).length;

  const holidayCount = rows.filter(
    (row) => row.attendance.status === "HOLIDAY",
  ).length;

  const weekOff = rows.filter(
    (row) => row.attendance.status === "WEEK_OFF",
  ).length;

  const checkedIn = rows.filter((row) =>
    Boolean(row.attendance.checkIn?.timestamp),
  ).length;

  const checkedOut = rows.filter((row) =>
    Boolean(row.attendance.checkOut?.timestamp),
  ).length;

  const late = rows.filter((row) => row.attendance.isLate === true).length;

  const earlyCheckout = rows.filter(
    (row) => row.attendance.isEarlyCheckout === true,
  ).length;

  const overtime = rows.filter(
    (row) => (row.attendance.overtimeMinutes || 0) > 0,
  ).length;

  /*
   * Only employees scheduled to work are considered
   * when calculating attendance rate.
   */

  const scheduledEmployees = rows.filter(
    (row) => row.meta.isWorkingDay && !row.meta.isCompanyHoliday,
  ).length;

  const attendanceRate =
    scheduledEmployees > 0
      ? Number(((present / scheduledEmployees) * 100).toFixed(2))
      : 0;

  /*
   * -------------------------------------------------------
   * 12. Return dashboard
   * -------------------------------------------------------
   */

  return {
    date: businessDate.toFormat("yyyy-MM-dd"),

    timezone,

    holiday: holiday
      ? {
          _id: holiday._id,

          name: holiday.name,

          date: holiday.date,

          isOptional: holiday.isOptional,
        }
      : null,

    summary: {
      totalEmployees,

      present,
      absent,
      halfDay,
      onLeave,

      holiday: holidayCount,
      weekOff,

      checkedIn,
      checkedOut,

      late,
      earlyCheckout,
      overtime,

      scheduledEmployees,

      attendanceRate,
    },

    employees: filteredRows,
  };
};

/* =========================================================
   ADMIN ATTENDANCE DETAIL
========================================================= */

/**
 * Get detailed attendance information for one employee
 * on one business date.
 *
 * This is used by the HR/Admin attendance detail drawer.
 */
export const getAttendanceDetail = async ({
  userId,
  companyId,
  employeeId,
  date,
  timezone = "Asia/Kolkata",
}) => {
  /*
   * -------------------------------------------------------
   * 1. Validate date
   * -------------------------------------------------------
   */

  const businessDate = date
    ? DateTime.fromISO(date, {
        zone: timezone,
      })
    : DateTime.now().setZone(timezone);

  if (!businessDate.isValid) {
    throw new Error("Invalid attendance date");
  }

  const startOfDay = businessDate.startOf("day").toJSDate();

  const endOfDay = businessDate.endOf("day").toJSDate();

  /*
   * -------------------------------------------------------
   * 2. Check employee visibility
   * -------------------------------------------------------
   *
   * This is important.
   *
   * An HR/Admin attendance endpoint must not allow a
   * manager/team leader to inspect an employee outside
   * their permitted organization scope.
   * -------------------------------------------------------
   */

  const scope = await getEmployeeScope({
    userId,
    companyId,
  });

  const employeeQuery = {
    _id: employeeId,
    companyId,
    isActive: true,
  };

  if (scope.employeeIds !== null) {
    employeeQuery._id = {
      $in: scope.employeeIds,
      $eq: employeeId,
    };
  }

  /*
   * -------------------------------------------------------
   * 3. Fetch employee
   * -------------------------------------------------------
   */

  const employee = await Employee.findOne(employeeQuery)
    .populate("departmentId", "name code")
    .populate("organizationUnitId", "name code level")
    .populate("reportsTo", "employeeCode firstName lastName designation")
    .select(
      [
        "_id",
        "employeeCode",
        "firstName",
        "lastName",
        "designation",
        "email",
        "phone",
        "departmentId",
        "organizationUnitId",
        "reportsTo",
        "workScheduleId",
        "employmentStatus",
        "joiningDate",
      ].join(" "),
    )
    .lean();

  if (!employee) {
    return null;
  }

  /*
   * -------------------------------------------------------
   * 4. Fetch employee work schedule
   * -------------------------------------------------------
   */

  const scheduleIds = [];

  if (employee.workScheduleId) {
    scheduleIds.push(employee.workScheduleId);
  }

  const scheduleQuery = {
    companyId,
    isActive: true,
    $or: [
      {
        isDefault: true,
      },
    ],
  };

  if (scheduleIds.length > 0) {
    scheduleQuery.$or.push({
      _id: {
        $in: scheduleIds,
      },
    });
  }

  const schedules = await WorkSchedule.find(scheduleQuery)
    .select("_id name code days isDefault")
    .lean();

  const schedulesById = new Map(
    schedules.map((schedule) => [schedule._id.toString(), schedule]),
  );

  const defaultSchedule =
    schedules.find((schedule) => schedule.isDefault) || null;

  const schedule = getScheduleForEmployee({
    employee,
    schedulesById,
    defaultSchedule,
  });

  /*
   * -------------------------------------------------------
   * 5. Determine today's schedule
   * -------------------------------------------------------
   */

  const scheduleDay = getScheduleDay(schedule, businessDate);

  const isWorkingDay = scheduleDay?.isWorkingDay === true;

  /*
   * -------------------------------------------------------
   * 6. Determine holiday
   * -------------------------------------------------------
   */

  const holiday = await getHolidayForDate({
    companyId,
    date: startOfDay,
    timezone,
  });

  const isCompanyHoliday = Boolean(holiday) && holiday.isOptional !== true;

  /*
   * -------------------------------------------------------
   * 7. Determine approved leave
   * -------------------------------------------------------
   */

  let approvedLeave = null;

  if (isWorkingDay && !isCompanyHoliday) {
    approvedLeave = await isEmployeeOnApprovedLeave({
      companyId,
      employeeId: employee._id,
      date: startOfDay,
      timezone,
    });
  }

  /*
   * -------------------------------------------------------
   * 8. Fetch attendance
   * -------------------------------------------------------
   */

  const attendance = await Attendance.findOne({
    companyId,
    employeeId: employee._id,
    date: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
  })
    .populate("createdBy", "name email")
    .populate("updatedBy", "name email")
    .lean();

  /*
   * -------------------------------------------------------
   * 9. Determine effective status
   * -------------------------------------------------------
   */

  let effectiveStatus;

  if (attendance) {
    effectiveStatus = attendance.status;
  } else if (isCompanyHoliday) {
    effectiveStatus = "HOLIDAY";
  } else if (approvedLeave) {
    effectiveStatus = "ON_LEAVE";
  } else if (!isWorkingDay) {
    effectiveStatus = "WEEK_OFF";
  } else {
    effectiveStatus = "ABSENT";
  }

  /*
   * -------------------------------------------------------
   * 10. Return detailed response
   * -------------------------------------------------------
   */

  return {
    date: businessDate.toFormat("yyyy-MM-dd"),

    timezone,

    employee: {
      _id: employee._id,

      employeeCode: employee.employeeCode,

      firstName: employee.firstName,

      lastName: employee.lastName,

      designation: employee.designation,

      email: employee.email,

      phone: employee.phone,

      employmentStatus: employee.employmentStatus,

      joiningDate: employee.joiningDate,
    },

    department: employee.departmentId
      ? {
          _id: employee.departmentId._id,

          name: employee.departmentId.name,

          code: employee.departmentId.code,
        }
      : null,

    organizationUnit: employee.organizationUnitId
      ? {
          _id: employee.organizationUnitId._id,

          name: employee.organizationUnitId.name,

          code: employee.organizationUnitId.code,

          level: employee.organizationUnitId.level,
        }
      : null,

    reportsTo: employee.reportsTo
      ? {
          _id: employee.reportsTo._id,

          employeeCode: employee.reportsTo.employeeCode,

          firstName: employee.reportsTo.firstName,

          lastName: employee.reportsTo.lastName,

          designation: employee.reportsTo.designation,
        }
      : null,

    schedule: schedule
      ? {
          _id: schedule._id,

          name: schedule.name,

          code: schedule.code,

          isDefault: schedule.isDefault,

          day: scheduleDay
            ? {
                dayOfWeek: scheduleDay.dayOfWeek,

                isWorkingDay: scheduleDay.isWorkingDay,

                startTime: scheduleDay.startTime,

                endTime: scheduleDay.endTime,

                breakMinutes: scheduleDay.breakMinutes,

                scheduledWorkingMinutes: calculateScheduledMinutes(scheduleDay),
              }
            : null,
        }
      : null,

    attendance: formatAttendance(attendance),

    status: effectiveStatus,

    context: {
      isWorkingDay,

      isCompanyHoliday,

      isOnApprovedLeave: Boolean(approvedLeave),

      hasAttendance: Boolean(attendance),
    },

    holiday: holiday
      ? {
          _id: holiday._id,

          name: holiday.name,

          date: holiday.date,

          isOptional: holiday.isOptional,
        }
      : null,

    leave: approvedLeave
      ? {
          _id: approvedLeave._id,

          leaveType: approvedLeave.leaveTypeId
            ? {
                _id: approvedLeave.leaveTypeId._id,

                name: approvedLeave.leaveTypeId.name,
              }
            : null,

          startDate: approvedLeave.startDate,

          endDate: approvedLeave.endDate,

          reason: approvedLeave.reason,

          status: approvedLeave.status,
        }
      : null,
  };
};
