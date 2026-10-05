import { DateTime } from "luxon";

import LeaveType from "../models/leaveType.model.js";
import LeaveBalance from "../models/leaveBalance.model.js";
import LeaveRequest from "../models/leaveRequest.model.js";

import Employee from "../../employee/models/employee.model.js";
import { WorkSchedule } from "../../attendance/models/workSchedule.model.js";
import Holiday from "../../holiday/models/holiday.model.js";
import Company from "../../company/models/company.model.js";

import ApiError from "../../../core/errors/ApiError.js";

/* =========================================================
   DATE HELPERS
========================================================= */

const normalizeDate = (value, timezone) => {
  const date = DateTime.fromISO(value, {
    zone: timezone,
  });

  if (!date.isValid) {
    throw new ApiError(400, `Invalid date: ${value}`);
  }

  return date.startOf("day").toUTC().toJSDate();
};

const getTimezone = async (companyId, session = null) => {
  const query = Company.findById(companyId).select("settings.timezone");

  if (session) {
    query.session(session);
  }

  const company = await query;

  if (!company) {
    throw new ApiError(404, "Company not found");
  }

  return company.settings?.timezone || "Asia/Kolkata";
};

/* =========================================================
   DEFAULT LEAVE TYPES
========================================================= */

export const initializeDefaultLeaveTypes = async ({
  companyId,
  userId,
  session,
}) => {
  const defaults = [
    {
      name: "Casual Leave",
      code: "CL",
      annualDays: 12,
      isPaid: true,
    },

    {
      name: "Sick Leave",
      code: "SL",
      annualDays: 12,
      isPaid: true,
    },

    {
      name: "Earned Leave",
      code: "EL",
      annualDays: 15,
      isPaid: true,
      carryForward: true,
      maxCarryForwardDays: 30,
    },

    {
      name: "Unpaid Leave",
      code: "LWP",
      annualDays: 0,
      isPaid: false,
      allowNegativeBalance: true,
    },
  ];

  for (const item of defaults) {
    await LeaveType.findOneAndUpdate(
      {
        companyId,
        code: item.code,
      },
      {
        $set: {
          ...item,
          isActive: true,
          updatedBy: userId,
        },

        $setOnInsert: {
          createdBy: userId,
        },
      },
      {
        upsert: true,
        returnDocument: "after",
        session,
      },
    );
  }
};

/* =========================================================
   LEAVE TYPE MANAGEMENT
========================================================= */

export const createLeaveType = async ({ companyId, userId, data }) => {
  try {
    return await LeaveType.create({
      ...data,
      companyId,
      createdBy: userId,
      updatedBy: userId,
    });
  } catch (error) {
    if (error?.code === 11000) {
      throw new ApiError(409, "Leave type code already exists");
    }

    throw error;
  }
};

export const getLeaveTypes = ({ companyId, includeInactive = false }) =>
  LeaveType.find({
    companyId,
    ...(includeInactive ? {} : { isActive: true }),
  }).sort({
    name: 1,
  });

export const updateLeaveType = async ({
  companyId,
  leaveTypeId,
  userId,
  data,
}) => {
  try {
    const item = await LeaveType.findOneAndUpdate(
      {
        _id: leaveTypeId,
        companyId,
      },
      {
        $set: {
          ...data,
          updatedBy: userId,
        },
      },
      {
        returnDocument: "after",
        runValidators: true,
      },
    );

    if (!item) {
      throw new ApiError(404, "Leave type not found");
    }

    return item;
  } catch (error) {
    if (error?.code === 11000) {
      throw new ApiError(409, "Leave type code already exists");
    }

    throw error;
  }
};

/* =========================================================
   EMPLOYEE SCHEDULE
========================================================= */

const getEmployeeSchedule = async ({ employee, companyId, session }) => {
  const query = employee.workScheduleId
    ? {
        _id: employee.workScheduleId,
        companyId,
        isActive: true,
      }
    : {
        companyId,
        isDefault: true,
        isActive: true,
      };

  const request = WorkSchedule.findOne(query);

  if (session) {
    request.session(session);
  }

  const schedule = await request;

  if (!schedule) {
    throw new ApiError(400, "Employee does not have an active work schedule");
  }

  return schedule;
};

/* =========================================================
   CALCULATE WORKING LEAVE DAYS
========================================================= */

const getWorkingLeaveDays = async ({
  employee,
  companyId,
  startDate,
  endDate,
  timezone,
  session = null,
}) => {
  const start = DateTime.fromJSDate(startDate, { zone: timezone });

  const end = DateTime.fromJSDate(endDate, { zone: timezone });

  const schedule = await getEmployeeSchedule({
    employee,
    companyId,
    session,
  });

  const holidayQuery = Holiday.find({
    companyId,
    isActive: true,

    date: {
      $gte: start.startOf("day").toUTC().toJSDate(),

      $lte: end.startOf("day").toUTC().toJSDate(),
    },
  }).select("date isOptional");

  if (session) {
    holidayQuery.session(session);
  }

  const holidays = await holidayQuery;

  const holidaySet = new Set(
    holidays
      .filter((holiday) => !holiday.isOptional)
      .map((holiday) =>
        DateTime.fromJSDate(holiday.date, { zone: timezone }).toISODate(),
      ),
  );

  let days = 0;

  for (
    let cursor = start.startOf("day");
    cursor <= end.startOf("day");
    cursor = cursor.plus({ days: 1 })
  ) {
    const scheduleDay = schedule.days.find(
      (day) => day.dayOfWeek === cursor.weekday % 7,
    );

    if (!scheduleDay?.isWorkingDay) {
      continue;
    }

    if (holidaySet.has(cursor.toISODate())) {
      continue;
    }

    days += 1;
  }

  return days;
};

/* =========================================================
   ENSURE BALANCE
========================================================= */

const ensureBalance = async ({
  companyId,
  employeeId,
  leaveType,
  year,
  userId,
  session,
}) => {
  return LeaveBalance.findOneAndUpdate(
    {
      companyId,
      employeeId,
      leaveTypeId: leaveType._id,
      year,
    },

    {
      $setOnInsert: {
        companyId,
        employeeId,
        leaveTypeId: leaveType._id,
        year,

        openingBalance: leaveType.annualDays,

        accrued: 0,
        carriedForward: 0,
        used: 0,
        pending: 0,
        adjusted: 0,

        createdBy: userId,
      },

      $set: {
        updatedBy: userId,
      },
    },

    {
      upsert: true,
      returnDocument: "after",
      session,
    },
  );
};

/* =========================================================
   OVERLAP CHECK
========================================================= */

const hasOverlap = async ({
  companyId,
  employeeId,
  startDate,
  endDate,
  excludeId = null,
  session = null,
}) => {
  const query = LeaveRequest.findOne({
    companyId,
    employeeId,

    status: {
      $in: ["PENDING", "APPROVED"],
    },

    ...(excludeId
      ? {
          _id: {
            $ne: excludeId,
          },
        }
      : {}),

    startDate: {
      $lte: endDate,
    },

    endDate: {
      $gte: startDate,
    },
  });

  if (session) {
    query.session(session);
  }

  return query;
};

/* =========================================================
   CREATE LEAVE REQUEST
========================================================= */

export const createLeaveRequest = async ({ companyId, userId, data }) => {
  const timezone = await getTimezone(companyId);

  const employee = await Employee.findOne({
    userId,
    companyId,
    isActive: true,
    employmentStatus: "ACTIVE",
  });

  if (!employee) {
    throw new ApiError(404, "Active employee profile not found");
  }

  const leaveType = await LeaveType.findOne({
    _id: data.leaveTypeId,
    companyId,
    isActive: true,
  });

  if (!leaveType) {
    throw new ApiError(404, "Leave type not found");
  }

  const startDate = normalizeDate(data.startDate, timezone);

  const endDate = normalizeDate(data.endDate, timezone);

  if (endDate < startDate) {
    throw new ApiError(400, "End date cannot be before start date");
  }

  const startYear = DateTime.fromJSDate(startDate, {
    zone: timezone,
  }).year;

  const endYear = DateTime.fromJSDate(endDate, {
    zone: timezone,
  }).year;

  if (startYear !== endYear) {
    throw new ApiError(400, "Leave requests cannot span multiple leave years");
  }

  const overlap = await hasOverlap({
    companyId,
    employeeId: employee._id,
    startDate,
    endDate,
  });

  if (overlap) {
    throw new ApiError(
      409,
      "An active leave request already overlaps these dates",
    );
  }

  const workingDays = await getWorkingLeaveDays({
    employee,
    companyId,
    startDate,
    endDate,
    timezone,
  });

  if (workingDays <= 0) {
    throw new ApiError(400, "Selected dates contain no scheduled working days");
  }

  const isHalfDay = data.totalDays === 0.5;

  const sameDay = DateTime.fromJSDate(startDate, { zone: timezone }).hasSame(
    DateTime.fromJSDate(endDate, { zone: timezone }),
    "day",
  );

  if (isHalfDay) {
    if (!sameDay || !leaveType.allowHalfDay || workingDays !== 1) {
      throw new ApiError(
        400,
        "Half-day leave is not allowed for the selected dates or leave type",
      );
    }
  } else if (Math.abs(workingDays - data.totalDays) > 0.01) {
    throw new ApiError(400, `Total leave days must be ${workingDays}`);
  }

  const year = DateTime.fromJSDate(startDate, {
    zone: timezone,
  }).year;

  const balance = await ensureBalance({
    companyId,
    employeeId: employee._id,
    leaveType,
    year,
    userId,
    session: null,
  });

  const available = balance.available;

  if (!leaveType.allowNegativeBalance && available < data.totalDays) {
    throw new ApiError(
      400,
      `Insufficient ${leaveType.name} balance. Available: ${available} days`,
    );
  }

  const status = leaveType.requiresApproval ? "PENDING" : "APPROVED";

  const request = await LeaveRequest.create({
    companyId,
    employeeId: employee._id,
    leaveTypeId: leaveType._id,

    startDate,
    endDate,

    totalDays: data.totalDays,

    reason: data.reason,

    status,

    requestedBy: userId,

    createdBy: userId,
    updatedBy: userId,

    ...(status === "APPROVED"
      ? {
          approvedBy: userId,
          decidedAt: new Date(),
        }
      : {}),
  });

  await LeaveBalance.updateOne(
    {
      _id: balance._id,
    },

    {
      $inc: {
        pending: status === "PENDING" ? data.totalDays : 0,

        used: status === "APPROVED" ? data.totalDays : 0,
      },

      $set: {
        updatedBy: userId,
      },
    },
  );

  return request;
};

/* =========================================================
   MY LEAVE REQUESTS
========================================================= */

export const getMyLeaveRequests = async ({
  companyId,
  userId,
  startDate,
  endDate,
}) => {
  const employee = await Employee.findOne({
    userId,
    companyId,
  });

  if (!employee) {
    throw new ApiError(404, "Employee profile not found");
  }

  const query = {
    companyId,
    employeeId: employee._id,
  };

  if (startDate || endDate) {
    const timezone = await getTimezone(companyId);

    query.startDate = {};

    if (startDate) {
      query.startDate.$gte = normalizeDate(startDate, timezone);
    }

    if (endDate) {
      query.startDate.$lte = normalizeDate(endDate, timezone);
    }
  }

  return LeaveRequest.find(query)
    .populate("leaveTypeId", "name code isPaid")
    .sort({
      startDate: -1,
    });
};

/* =========================================================
   LEAVE BALANCES
========================================================= */

export const getLeaveBalances = async ({ companyId, userId, year }) => {
  const employee = await Employee.findOne({
    userId,
    companyId,
  });

  if (!employee) {
    throw new ApiError(404, "Employee profile not found");
  }

  return LeaveBalance.find({
    companyId,
    employeeId: employee._id,
    year,
  })
    .populate("leaveTypeId", "name code isPaid annualDays")
    .sort({
      "leaveTypeId.name": 1,
    });
};

/* =========================================================
   PENDING REQUESTS
========================================================= */

export const getPendingLeaveRequests = ({ companyId }) =>
  LeaveRequest.find({
    companyId,
    status: "PENDING",
  })
    .populate(
      "employeeId",
      "employeeCode firstName lastName designation reportsTo",
    )
    .populate("leaveTypeId", "name code isPaid")
    .sort({
      startDate: 1,
    });

/* =========================================================
   APPROVE / REJECT
========================================================= */

export const decideLeaveRequest = async ({
  companyId,
  leaveRequestId,
  userId,
  approve,
  decisionReason,
}) => {
  const request = await LeaveRequest.findOne({
    _id: leaveRequestId,
    companyId,
  });

  if (!request) {
    throw new ApiError(404, "Leave request not found");
  }

  if (request.status !== "PENDING") {
    throw new ApiError(
      400,
      `Leave request is already ${request.status.toLowerCase()}`,
    );
  }

  const leaveType = await LeaveType.findOne({
    _id: request.leaveTypeId,
    companyId,
    isActive: true,
  });

  if (!leaveType) {
    throw new ApiError(400, "Leave type is inactive or unavailable");
  }

  const timezone = await getTimezone(companyId);

  const year = DateTime.fromJSDate(request.startDate, {
    zone: timezone,
  }).year;

  const balance = await ensureBalance({
    companyId,
    employeeId: request.employeeId,
    leaveType,
    year,
    userId,
    session: null,
  });

  if (approve) {
    request.status = "APPROVED";
    request.approvedBy = userId;
    request.decidedAt = new Date();
    request.decisionReason = decisionReason;
    request.updatedBy = userId;

    await request.save();

    await LeaveBalance.updateOne(
      {
        _id: balance._id,
      },
      {
        $inc: {
          pending: -request.totalDays,
          used: request.totalDays,
        },

        $set: {
          updatedBy: userId,
        },
      },
    );
  } else {
    request.status = "REJECTED";
    request.approvedBy = userId;
    request.decidedAt = new Date();
    request.decisionReason = decisionReason;
    request.updatedBy = userId;

    await request.save();

    await LeaveBalance.updateOne(
      {
        _id: balance._id,
      },
      {
        $inc: {
          pending: -request.totalDays,
        },

        $set: {
          updatedBy: userId,
        },
      },
    );
  }

  return request;
};

/* =========================================================
   CANCEL REQUEST
========================================================= */

export const cancelLeaveRequest = async ({
  companyId,
  userId,
  leaveRequestId,
}) => {
  const employee = await Employee.findOne({
    userId,
    companyId,
    isActive: true,
  });

  if (!employee) {
    throw new ApiError(404, "Employee profile not found");
  }

  const request = await LeaveRequest.findOne({
    _id: leaveRequestId,
    companyId,
    employeeId: employee._id,
  });

  if (!request) {
    throw new ApiError(404, "Leave request not found");
  }

  if (!["PENDING", "APPROVED"].includes(request.status)) {
    throw new ApiError(
      400,
      `Leave request cannot be cancelled from ${request.status.toLowerCase()} status`,
    );
  }

  const timezone = await getTimezone(companyId);

  const year = DateTime.fromJSDate(request.startDate, {
    zone: timezone,
  }).year;

  const balance = await LeaveBalance.findOne({
    companyId,
    employeeId: employee._id,
    leaveTypeId: request.leaveTypeId,
    year,
  });

  if (balance) {
    if (request.status === "PENDING") {
      balance.pending = Math.max(0, balance.pending - request.totalDays);
    }

    if (request.status === "APPROVED") {
      balance.used = Math.max(0, balance.used - request.totalDays);
    }

    balance.updatedBy = userId;

    await balance.save();
  }

  request.status = "CANCELLED";
  request.updatedBy = userId;

  await request.save();

  return request;
};

/* =========================================================
   ATTENDANCE INTEGRATION
========================================================= */

export const isEmployeeOnApprovedLeave = async ({
  companyId,
  employeeId,
  date,
  timezone,
}) => {
  const normalized = normalizeDate(date, timezone);

  return LeaveRequest.findOne({
    companyId,
    employeeId,
    status: "APPROVED",

    startDate: {
      $lte: normalized,
    },

    endDate: {
      $gte: normalized,
    },
  }).populate("leaveTypeId", "name code");
};
