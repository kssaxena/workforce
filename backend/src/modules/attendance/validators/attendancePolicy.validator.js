import Joi from "joi";

export const createAttendancePolicySchema = Joi.object({
  workingHours: Joi.number().min(0).max(24).default(8),

  workingMinutes: Joi.number().integer().min(0).max(1440).default(480),

  lateArrivalGraceMinutes: Joi.number().integer().min(0).default(15),

  earlyDepartureGraceMinutes: Joi.number().integer().min(0).default(15),

  overtimeEnabled: Joi.boolean().default(false),

  minimumOvertimeMinutes: Joi.number().integer().min(0).default(30),

  halfDayEnabled: Joi.boolean().default(true),

  halfDayAfterMinutes: Joi.number().integer().min(0).default(240),

  allowLateCheckIn: Joi.boolean().default(true),

  allowEarlyCheckout: Joi.boolean().default(true),

  requireCheckOut: Joi.boolean().default(true),

  breakEnabled: Joi.boolean().default(false),

  breakMinutes: Joi.number().integer().min(0).default(60),
});

export const updateAttendancePolicySchema = Joi.object({
  workingHours: Joi.number().min(0).max(24),

  workingMinutes: Joi.number().integer().min(0).max(1440),

  lateArrivalGraceMinutes: Joi.number().integer().min(0),

  earlyDepartureGraceMinutes: Joi.number().integer().min(0),

  overtimeEnabled: Joi.boolean(),

  minimumOvertimeMinutes: Joi.number().integer().min(0),

  halfDayEnabled: Joi.boolean(),

  halfDayAfterMinutes: Joi.number().integer().min(0),

  allowLateCheckIn: Joi.boolean(),

  allowEarlyCheckout: Joi.boolean(),

  requireCheckOut: Joi.boolean(),

  breakEnabled: Joi.boolean(),

  breakMinutes: Joi.number().integer().min(0),
}).min(1);
