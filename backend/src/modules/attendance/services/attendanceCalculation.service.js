import { DateTime } from "luxon";

import { WorkSchedule } from "../models/workSchedule.model.js";
import { AttendancePolicy } from "../models/attendancePolicy.model.js";

import { ApiError } from "../../../core/errors/ApiError.js";

const getScheduleForDate = async ({
  companyId,
  employee,
  date,
  session = null,
}) => {
  let schedule = null;

  if (employee.workScheduleId) {
    schedule = await WorkSchedule.findOne({
      _id: employee.workScheduleId,
      companyId,
      isActive: true,
    }).session(session);
  }

  if (!schedule) {
    schedule = await WorkSchedule.findOne({
      companyId,
      isDefault: true,
      isActive: true,
    }).session(session);
  }

  if (!schedule) {
    throw new ApiError(400, "No active work schedule found for employee");
  }

  const dayOfWeek = date.weekday % 7;

  const scheduleDay = schedule.days.find((day) => day.dayOfWeek === dayOfWeek);

  if (!scheduleDay) {
    throw new ApiError(
      500,
      "Work schedule is missing the required day configuration",
    );
  }

  return {
    schedule,
    scheduleDay,
  };
};

const buildScheduleDateTime = ({ date, time }) => {
  const [hour, minute] = time.split(":").map(Number);

  return date.set({
    hour,
    minute,
    second: 0,
    millisecond: 0,
  });
};

const resolveAttendanceSchedule = async ({
  companyId,
  employee,
  timestamp,
  timezone,
  session = null,
}) => {
  const date = DateTime.fromJSDate(timestamp, {
    zone: timezone,
  });

  const { schedule, scheduleDay } = await getScheduleForDate({
    companyId,
    employee,
    date,
    session,
  });

  if (!scheduleDay.isWorkingDay) {
    return {
      schedule,
      scheduleDay,
      isWorkingDay: false,
      date,
      scheduledStart: null,
      scheduledEnd: null,
      scheduledWorkingMinutes: 0,
    };
  }

  let scheduledStart = buildScheduleDateTime({
    date,
    time: scheduleDay.startTime,
  });

  let scheduledEnd = buildScheduleDateTime({
    date,
    time: scheduleDay.endTime,
  });

  /*
   * Night shifts can cross midnight.
   *
   * Example:
   * 22:00 → 06:00
   */

  if (scheduledEnd <= scheduledStart) {
    scheduledEnd = scheduledEnd.plus({
      days: 1,
    });
  }

  const scheduledWorkingMinutes = Math.max(
    0,
    Math.round(scheduledEnd.diff(scheduledStart, "minutes").minutes) -
      scheduleDay.breakMinutes,
  );

  return {
    schedule,
    scheduleDay,
    isWorkingDay: true,
    date,
    scheduledStart,
    scheduledEnd,
    scheduledWorkingMinutes,
  };
};

const calculateLateArrival = ({ checkInTime, scheduledStart, policy }) => {
  if (!scheduledStart) {
    return {
      isLate: false,
      lateMinutes: 0,
    };
  }

  const difference = Math.max(
    0,
    Math.round(checkInTime.diff(scheduledStart, "minutes").minutes),
  );

  if (difference <= policy.lateArrivalGraceMinutes) {
    return {
      isLate: false,
      lateMinutes: 0,
    };
  }

  return {
    isLate: true,
    lateMinutes: difference,
  };
};

const calculateEarlyCheckout = ({ checkOutTime, scheduledEnd, policy }) => {
  if (!scheduledEnd) {
    return {
      isEarlyCheckout: false,
      earlyCheckoutMinutes: 0,
    };
  }

  const difference = Math.max(
    0,
    Math.round(scheduledEnd.diff(checkOutTime, "minutes").minutes),
  );

  if (difference <= policy.earlyDepartureGraceMinutes) {
    return {
      isEarlyCheckout: false,
      earlyCheckoutMinutes: 0,
    };
  }

  return {
    isEarlyCheckout: true,
    earlyCheckoutMinutes: difference,
  };
};

const calculateOvertime = ({
  totalWorkedMinutes,
  scheduledWorkingMinutes,
  policy,
}) => {
  if (!policy.overtimeEnabled) {
    return 0;
  }

  const overtime = Math.max(0, totalWorkedMinutes - scheduledWorkingMinutes);

  if (overtime < policy.minimumOvertimeMinutes) {
    return 0;
  }

  return overtime;
};

const determineAttendanceStatus = ({
  totalWorkedMinutes,
  scheduledWorkingMinutes,
  policy,
}) => {
  if (scheduledWorkingMinutes === 0) {
    return "WEEK_OFF";
  }

  if (
    policy.halfDayEnabled &&
    totalWorkedMinutes < policy.halfDayAfterMinutes
  ) {
    return "HALF_DAY";
  }

  return "PRESENT";
};

export const calculateCheckInMetrics = async ({
  companyId,
  employee,
  checkInTimestamp,
  timezone,
  session = null,
}) => {
  const policy = await AttendancePolicy.findOne({
    companyId,
    isActive: true,
  }).session(session);

  if (!policy) {
    throw new ApiError(400, "Attendance policy not configured");
  }

  const {
    schedule,
    scheduleDay,
    isWorkingDay,
    date,
    scheduledStart,
    scheduledEnd,
    scheduledWorkingMinutes,
  } = await resolveAttendanceSchedule({
    companyId,
    employee,
    timestamp: checkInTimestamp,
    timezone,
    session,
  });

  if (!isWorkingDay) {
    return {
      policy,
      schedule,
      scheduleDay,
      isWorkingDay: false,
      scheduledWorkingMinutes: 0,
      isLate: false,
      lateMinutes: 0,
    };
  }

  const checkInTime = DateTime.fromJSDate(checkInTimestamp, {
    zone: timezone,
  });

  const { isLate, lateMinutes } = calculateLateArrival({
    checkInTime,
    scheduledStart,
    policy,
  });

  return {
    policy,
    schedule,
    scheduleDay,

    isWorkingDay,

    scheduledWorkingMinutes,

    scheduledStart: scheduledStart.toJSDate(),

    scheduledEnd: scheduledEnd.toJSDate(),

    isLate,
    lateMinutes,
  };
};

export const calculateCheckOutMetrics = async ({
  companyId,
  employee,
  checkInTimestamp,
  checkOutTimestamp,
  timezone,
  session = null,
}) => {
  const policy = await AttendancePolicy.findOne({
    companyId,
    isActive: true,
  }).session(session);

  if (!policy) {
    throw new ApiError(400, "Attendance policy not configured");
  }

  const {
    schedule,
    scheduleDay,
    isWorkingDay,
    scheduledStart,
    scheduledEnd,
    scheduledWorkingMinutes,
  } = await resolveAttendanceSchedule({
    companyId,
    employee,
    timestamp: checkInTimestamp,
    timezone,
    session,
  });

  const checkInTime = DateTime.fromJSDate(checkInTimestamp, {
    zone: timezone,
  });

  const checkOutTime = DateTime.fromJSDate(checkOutTimestamp, {
    zone: timezone,
  });

  const totalWorkedMinutes = Math.max(
    0,
    Math.round(checkOutTime.diff(checkInTime, "minutes").minutes) -
      (scheduleDay?.breakMinutes || 0),
  );

  if (!isWorkingDay) {
    return {
      policy,
      schedule,
      scheduleDay,
      isWorkingDay: false,
      scheduledWorkingMinutes: 0,
      totalWorkedMinutes,
      isEarlyCheckout: false,
      earlyCheckoutMinutes: 0,
      overtimeMinutes: 0,
      status: "WEEK_OFF",
    };
  }

  const { isEarlyCheckout, earlyCheckoutMinutes } = calculateEarlyCheckout({
    checkOutTime,
    scheduledEnd,
    policy,
  });

  const overtimeMinutes = calculateOvertime({
    totalWorkedMinutes,
    scheduledWorkingMinutes,
    policy,
  });

  const status = determineAttendanceStatus({
    totalWorkedMinutes,
    scheduledWorkingMinutes,
    policy,
  });

  return {
    policy,
    schedule,
    scheduleDay,

    isWorkingDay,

    scheduledWorkingMinutes,

    totalWorkedMinutes,

    isEarlyCheckout,

    earlyCheckoutMinutes,

    overtimeMinutes,

    status,
  };
};
