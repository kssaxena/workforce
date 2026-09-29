import Joi from "joi";

const scheduleDaySchema = Joi.object({
  dayOfWeek: Joi.number().integer().min(0).max(6).required(),

  isWorkingDay: Joi.boolean().default(true),

  startTime: Joi.string()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .when("isWorkingDay", {
      is: true,
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),

  endTime: Joi.string()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .when("isWorkingDay", {
      is: true,
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),

  breakMinutes: Joi.number().integer().min(0).default(0),
});

export const createWorkScheduleSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),

  code: Joi.string().trim().uppercase().min(2).max(50).required(),

  description: Joi.string().trim().allow("", null),

  timezone: Joi.string().trim().default("Asia/Kolkata"),

  days: Joi.array().items(scheduleDaySchema).length(7).required(),

  isDefault: Joi.boolean().default(false),
});

export const updateWorkScheduleSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100),

  code: Joi.string().trim().uppercase().min(2).max(50),

  description: Joi.string().trim().allow("", null),

  timezone: Joi.string().trim(),

  days: Joi.array().items(scheduleDaySchema).length(7),

  isDefault: Joi.boolean(),

  isActive: Joi.boolean(),
}).min(1);
