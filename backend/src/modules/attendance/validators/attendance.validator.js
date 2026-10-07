import Joi from "joi";

export const checkInSchema = Joi.object({
  latitude: Joi.number().min(-90).max(90).required(),

  longitude: Joi.number().min(-180).max(180).required(),

  accuracy: Joi.number().min(0).allow(null),

  source: Joi.string().valid("WEB", "MOBILE").default("WEB"),
});

export const checkOutSchema = Joi.object({
  latitude: Joi.number().min(-90).max(90).required(),

  longitude: Joi.number().min(-180).max(180).required(),

  accuracy: Joi.number().min(0).allow(null),

  source: Joi.string().valid("WEB", "MOBILE").default("WEB"),
});

export const regularizeAttendanceSchema = Joi.object({
  employeeId: Joi.string().hex().length(24).required(),

  date: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .required(),

  status: Joi.string()
    .valid("PRESENT", "ABSENT", "HALF_DAY", "ON_LEAVE", "HOLIDAY", "WEEK_OFF")
    .required(),

  checkIn: Joi.string().isoDate().allow(null),

  checkOut: Joi.string().isoDate().allow(null),

  remarks: Joi.string().trim().max(1000).allow("", null),
});

export const createAttendanceRegularizationSchema = Joi.object({
  date: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .required(),

  requestedStatus: Joi.string()
    .valid("PRESENT", "ABSENT", "HALF_DAY", "ON_LEAVE", "HOLIDAY", "WEEK_OFF")
    .required(),

  requestedCheckIn: Joi.string().isoDate().allow(null),

  requestedCheckOut: Joi.string().isoDate().allow(null),

  reason: Joi.string().trim().min(5).max(1000).required(),
});

export const reviewAttendanceRegularizationSchema = Joi.object({
  decision: Joi.string().valid("APPROVED", "REJECTED").required(),

  reviewRemarks: Joi.string().trim().max(1000).allow("", null),
});
