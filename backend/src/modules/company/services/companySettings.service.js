import Company from "../models/company.model.js";
import ApiError from "../../../core/errors/ApiError.js";

export const getAttendanceSettings = async ({ companyId }) => {
  const company = await Company.findById(companyId).select(
    "name settings.timezone settings.currency settings.attendanceEnabled settings.gpsAttendanceEnabled settings.attendanceRadius settings.attendanceLocation",
  );

  if (!company) {
    throw new ApiError(404, "Company not found");
  }

  return {
    companyId: company._id,

    companyName: company.name,

    timezone: company.settings?.timezone || "Asia/Kolkata",

    currency: company.settings?.currency || "INR",

    attendanceEnabled: company.settings?.attendanceEnabled ?? true,

    gpsAttendanceEnabled: company.settings?.gpsAttendanceEnabled ?? false,

    attendanceRadius: company.settings?.attendanceRadius ?? 200,

    attendanceLocation: company.settings?.attendanceLocation || null,
  };
};

export const updateAttendanceSettings = async ({ companyId, userId, data }) => {
  const company = await Company.findById(companyId);

  if (!company) {
    throw new ApiError(404, "Company not found");
  }

  if (data.attendanceEnabled !== undefined) {
    company.settings.attendanceEnabled = data.attendanceEnabled;
  }

  if (data.gpsAttendanceEnabled !== undefined) {
    company.settings.gpsAttendanceEnabled = data.gpsAttendanceEnabled;
  }

  if (data.attendanceRadius !== undefined) {
    company.settings.attendanceRadius = data.attendanceRadius;
  }

  if (data.attendanceLocation !== undefined) {
    company.settings.attendanceLocation = data.attendanceLocation;
  }

  company.updatedBy = userId;

  await company.save();

  return {
    companyId: company._id,

    companyName: company.name,

    timezone: company.settings?.timezone || "Asia/Kolkata",

    currency: company.settings?.currency || "INR",

    attendanceEnabled: company.settings?.attendanceEnabled ?? true,

    gpsAttendanceEnabled: company.settings?.gpsAttendanceEnabled ?? false,

    attendanceRadius: company.settings?.attendanceRadius ?? 200,

    attendanceLocation: company.settings?.attendanceLocation || null,
  };
};
