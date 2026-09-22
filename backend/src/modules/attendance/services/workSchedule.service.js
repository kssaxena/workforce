import mongoose from "mongoose";
import { WorkSchedule } from "../models/workSchedule.model.js";

export const createWorkSchedule = async ({
  companyId,
  userId,
  data,
  session = null,
}) => {
  const existingSchedule = await WorkSchedule.findOne({
    companyId,
    code: data.code,
  }).session(session);

  if (existingSchedule) {
    throw new Error("Work schedule code already exists");
  }

  if (data.isDefault) {
    await WorkSchedule.updateMany(
      {
        companyId,
        isDefault: true,
      },
      {
        $set: {
          isDefault: false,
        },
      },
    ).session(session);
  }

  const [schedule] = await WorkSchedule.create(
    [
      {
        companyId,
        ...data,
        createdBy: userId,
        updatedBy: userId,
      },
    ],
    {
      session,
    },
  );

  return schedule;
};

export const getWorkSchedules = async ({
  companyId,
  includeInactive = false,
}) => {
  const query = {
    companyId,
  };

  if (!includeInactive) {
    query.isActive = true;
  }

  return WorkSchedule.find(query).sort({
    isDefault: -1,
    name: 1,
  });
};

export const getWorkScheduleById = async ({ companyId, scheduleId }) => {
  if (!mongoose.Types.ObjectId.isValid(scheduleId)) {
    throw new Error("Invalid work schedule ID");
  }

  const schedule = await WorkSchedule.findOne({
    _id: scheduleId,
    companyId,
  });

  if (!schedule) {
    throw new Error("Work schedule not found");
  }

  return schedule;
};

export const updateWorkSchedule = async ({
  companyId,
  scheduleId,
  userId,
  data,
}) => {
  const schedule = await getWorkScheduleById({
    companyId,
    scheduleId,
  });

  if (data.code && data.code !== schedule.code) {
    const duplicate = await WorkSchedule.findOne({
      companyId,
      code: data.code,
      _id: {
        $ne: scheduleId,
      },
    });

    if (duplicate) {
      throw new Error("Work schedule code already exists");
    }
  }

  if (data.isDefault === true) {
    await WorkSchedule.updateMany(
      {
        companyId,
        _id: {
          $ne: scheduleId,
        },
        isDefault: true,
      },
      {
        $set: {
          isDefault: false,
        },
      },
    );
  }

  Object.assign(schedule, data);

  schedule.updatedBy = userId;

  await schedule.save();

  return schedule;
};

export const deactivateWorkSchedule = async ({
  companyId,
  scheduleId,
  userId,
}) => {
  const schedule = await getWorkScheduleById({
    companyId,
    scheduleId,
  });

  schedule.isActive = false;
  schedule.updatedBy = userId;

  await schedule.save();

  return schedule;
};

export const initializeDefaultWorkSchedule = async ({
  companyId,
  userId,
  timezone = "Asia/Kolkata",
  session = null,
}) => {
  const existingSchedule = await WorkSchedule.findOne({
    companyId,
    isDefault: true,
  }).session(session);

  if (existingSchedule) {
    return existingSchedule;
  }

  const days = [
    {
      dayOfWeek: 0,
      isWorkingDay: false,
      startTime: "00:00",
      endTime: "00:00",
      breakMinutes: 0,
    },

    {
      dayOfWeek: 1,
      isWorkingDay: true,
      startTime: "09:00",
      endTime: "18:00",
      breakMinutes: 60,
    },

    {
      dayOfWeek: 2,
      isWorkingDay: true,
      startTime: "09:00",
      endTime: "18:00",
      breakMinutes: 60,
    },

    {
      dayOfWeek: 3,
      isWorkingDay: true,
      startTime: "09:00",
      endTime: "18:00",
      breakMinutes: 60,
    },

    {
      dayOfWeek: 4,
      isWorkingDay: true,
      startTime: "09:00",
      endTime: "18:00",
      breakMinutes: 60,
    },

    {
      dayOfWeek: 5,
      isWorkingDay: true,
      startTime: "09:00",
      endTime: "18:00",
      breakMinutes: 60,
    },

    {
      dayOfWeek: 6,
      isWorkingDay: false,
      startTime: "00:00",
      endTime: "00:00",
      breakMinutes: 0,
    },
  ];

  const [schedule] = await WorkSchedule.create(
    [
      {
        companyId,
        name: "Default Work Schedule",
        code: "DEFAULT",
        description: "Default Monday to Friday work schedule",
        timezone,
        days,
        isDefault: true,
        isActive: true,
        createdBy: userId,
        updatedBy: userId,
      },
    ],
    {
      session,
    },
  );

  return schedule;
};
