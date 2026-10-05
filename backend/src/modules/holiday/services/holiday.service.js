import { DateTime } from "luxon";

import Holiday from "../models/holiday.model.js";
import Company from "../../company/models/company.model.js";
import ApiError from "../../../core/errors/ApiError.js";

const normalizeHolidayDate = ({ date, timezone }) => {
  const parsed = DateTime.fromISO(date, { zone: timezone });

  if (!parsed.isValid) {
    throw new ApiError(400, `Invalid holiday date: ${date}`);
  }

  return parsed.startOf("day").toUTC().toJSDate();
};

const getCompanyTimezone = async (companyId) => {
  const company = await Company.findById(companyId).select("settings.timezone");

  if (!company) {
    throw new ApiError(404, "Company not found");
  }

  return company.settings?.timezone || "Asia/Kolkata";
};

export const createHoliday = async ({ companyId, userId, data }) => {
  const timezone = await getCompanyTimezone(companyId);
  const normalizedDate = normalizeHolidayDate({
    date: data.date,
    timezone,
  });

  try {
    return await Holiday.create({
      companyId,
      name: data.name,
      date: normalizedDate,
      description: data.description,
      type: data.type || "COMPANY",
      isOptional: data.isOptional ?? false,
      createdBy: userId,
      updatedBy: userId,
    });
  } catch (error) {
    if (error?.code === 11000) {
      throw new ApiError(
        409,
        "A holiday with the same name already exists for this date",
      );
    }
    throw error;
  }
};

export const getHolidays = async ({
  companyId,
  startDate,
  endDate,
  includeInactive = false,
}) => {
  const timezone = await getCompanyTimezone(companyId);
  const query = { companyId };

  if (!includeInactive) query.isActive = true;

  if (startDate || endDate) {
    query.date = {};

    if (startDate) {
      query.date.$gte = normalizeHolidayDate({
        date: startDate,
        timezone,
      });
    }

    if (endDate) {
      query.date.$lte = normalizeHolidayDate({
        date: endDate,
        timezone,
      });
    }
  }

  return Holiday.find(query).sort({ date: 1, name: 1 });
};

export const getHolidayById = async ({ companyId, holidayId }) => {
  const holiday = await Holiday.findOne({ _id: holidayId, companyId });

  if (!holiday) {
    throw new ApiError(404, "Holiday not found");
  }

  return holiday;
};

export const updateHoliday = async ({ companyId, holidayId, userId, data }) => {
  const timezone = await getCompanyTimezone(companyId);
  const update = { ...data, updatedBy: userId };

  if (data.date) {
    update.date = normalizeHolidayDate({
      date: data.date,
      timezone,
    });
  }

  try {
    const holiday = await Holiday.findOneAndUpdate(
      { _id: holidayId, companyId },
      { $set: update },
      { returnDocument: "after", runValidators: true },
    );

    if (!holiday) {
      throw new ApiError(404, "Holiday not found");
    }

    return holiday;
  } catch (error) {
    if (error?.code === 11000) {
      throw new ApiError(
        409,
        "A holiday with the same name already exists for this date",
      );
    }
    throw error;
  }
};

export const deactivateHoliday = async ({ companyId, holidayId, userId }) => {
  const holiday = await Holiday.findOneAndUpdate(
    { _id: holidayId, companyId },
    {
      $set: {
        isActive: false,
        updatedBy: userId,
      },
    },
    { returnDocument: "after" },
  );

  if (!holiday) {
    throw new ApiError(404, "Holiday not found");
  }

  return holiday;
};

export const getHolidayForDate = async ({ companyId, date, timezone }) => {
  const normalizedDate = normalizeHolidayDate({ date, timezone });

  return Holiday.findOne({
    companyId,
    date: normalizedDate,
    isActive: true,
  });
};
