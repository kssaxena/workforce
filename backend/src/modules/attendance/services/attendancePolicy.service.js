import { AttendancePolicy } from "../models/attendancePolicy.model.js";

export const createAttendancePolicy = async ({ companyId, userId, data }) => {
  const existingPolicy = await AttendancePolicy.findOne({
    companyId,
  });

  if (existingPolicy) {
    throw new Error("Attendance policy already exists for this company");
  }

  const policy = await AttendancePolicy.create({
    companyId,
    ...data,
    createdBy: userId,
    updatedBy: userId,
  });

  return policy;
};

export const getAttendancePolicy = async ({ companyId }) => {
  const policy = await AttendancePolicy.findOne({
    companyId,
    isActive: true,
  });

  if (!policy) {
    throw new Error("Attendance policy not found");
  }

  return policy;
};

export const updateAttendancePolicy = async ({ companyId, userId, data }) => {
  const policy = await AttendancePolicy.findOne({
    companyId,
  });

  if (!policy) {
    throw new Error("Attendance policy not found");
  }

  Object.assign(policy, data);

  policy.updatedBy = userId;

  await policy.save();

  return policy;
};

export const initializeDefaultAttendancePolicy = async ({
  companyId,
  userId,
  session = null,
}) => {
  const existingPolicy = await AttendancePolicy.findOne({
    companyId,
  }).session(session);

  if (existingPolicy) {
    return existingPolicy;
  }

  const [policy] = await AttendancePolicy.create(
    [
      {
        companyId,

        workingHours: 8,
        workingMinutes: 480,

        lateArrivalGraceMinutes: 15,

        earlyDepartureGraceMinutes: 15,

        overtimeEnabled: false,

        minimumOvertimeMinutes: 30,

        halfDayEnabled: true,

        halfDayAfterMinutes: 240,

        allowLateCheckIn: true,

        allowEarlyCheckout: true,

        requireCheckOut: true,

        breakEnabled: true,

        breakMinutes: 60,

        createdBy: userId,
        updatedBy: userId,
      },
    ],
    {
      session,
    },
  );

  return policy;
};
