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
    .populate(
      "employeeId",
      "employeeCode firstName lastName designation departmentId organizationUnitId",
    )
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
  }).populate(
    "employeeId",
    "employeeCode firstName lastName designation departmentId organizationUnitId",
  );
};

/* -------------------------------------------------------------------------- */
/*                         HR / ADMIN ATTENDANCE                              */
/* -------------------------------------------------------------------------- */

export const getCompanyAttendance = async ({
  companyId,
  startDate,
  endDate,
  employeeId,
  departmentId,
  organizationUnitId,
  status,
  search,
}) => {
  const query = {
    companyId,
  };

  /*
   * Date filter
   */
  if (startDate || endDate) {
    query.date = {};

    if (startDate) {
      query.date.$gte = new Date(startDate);
    }

    if (endDate) {
      query.date.$lte = new Date(endDate);
    }
  }

  /*
   * Employee filter
   */
  if (employeeId) {
    query.employeeId = employeeId;
  }

  /*
   * Attendance status
   */
  if (status) {
    query.status = status;
  }

  /*
   * Fetch attendance records first.
   *
   * Department / organization-unit filtering is handled after
   * populating the employee because those references belong to
   * the Employee document.
   */
  let attendanceQuery = Attendance.find(query)
    .populate({
      path: "employeeId",
      select:
        "employeeCode firstName lastName designation departmentId organizationUnitId employmentStatus",
      populate: [
        {
          path: "departmentId",
          select: "name code",
        },
        {
          path: "organizationUnitId",
          select: "name code level",
        },
      ],
    })
    .sort({
      date: -1,
    });

  let attendance = await attendanceQuery.lean();

  /*
   * Department filter
   */
  if (departmentId) {
    attendance = attendance.filter(
      (record) =>
        record.employeeId?.departmentId?._id?.toString() ===
        departmentId.toString(),
    );
  }

  /*
   * Organization unit filter
   */
  if (organizationUnitId) {
    attendance = attendance.filter(
      (record) =>
        record.employeeId?.organizationUnitId?._id?.toString() ===
        organizationUnitId.toString(),
    );
  }

  /*
   * Employee search
   *
   * Searches:
   * - employee code
   * - first name
   * - last name
   * - designation
   */
  if (search?.trim()) {
    const searchTerm = search.trim().toLowerCase();

    attendance = attendance.filter((record) => {
      const employee = record.employeeId;

      if (!employee) return false;

      const searchableText = [
        employee.employeeCode,
        employee.firstName,
        employee.lastName,
        employee.designation,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(searchTerm);
    });
  }

  return attendance;
};

export const getAttendanceSummary = async ({
  companyId,
  startDate,
  endDate,
  employeeId,
  departmentId,
  organizationUnitId,
}) => {
  const query = {
    companyId,
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

  if (employeeId) {
    query.employeeId = employeeId;
  }

  /*
   * When department / organization filtering is required,
   * fetch employee IDs first.
   */
  if (departmentId || organizationUnitId) {
    const Employee = (await import("../../employee/models/employee.model.js"))
      .default;

    const employeeQuery = {
      companyId,
      isActive: true,
    };

    if (departmentId) {
      employeeQuery.departmentId = departmentId;
    }

    if (organizationUnitId) {
      employeeQuery.organizationUnitId = organizationUnitId;
    }

    const employees = await Employee.find(employeeQuery).select("_id").lean();

    query.employeeId = {
      $in: employees.map((employee) => employee._id),
    };
  }

  const summary = await Attendance.aggregate([
    {
      $match: query,
    },
    {
      $group: {
        _id: "$status",
        count: {
          $sum: 1,
        },
      },
    },
  ]);

  const result = {
    total: 0,
    present: 0,
    absent: 0,
    halfDay: 0,
    onLeave: 0,
    holiday: 0,
    weekOff: 0,
  };

  summary.forEach((item) => {
    const count = item.count || 0;

    result.total += count;

    switch (item._id) {
      case "PRESENT":
        result.present = count;
        break;

      case "ABSENT":
        result.absent = count;
        break;

      case "HALF_DAY":
        result.halfDay = count;
        break;

      case "ON_LEAVE":
        result.onLeave = count;
        break;

      case "HOLIDAY":
        result.holiday = count;
        break;

      case "WEEK_OFF":
        result.weekOff = count;
        break;

      default:
        break;
    }
  });

  return result;
};
