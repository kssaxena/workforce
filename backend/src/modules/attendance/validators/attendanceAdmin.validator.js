import Joi from "joi";

export const attendanceDashboardQuerySchema = Joi.object({
  date: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .required(),

  departmentId: Joi.string().hex().length(24).optional(),

  organizationUnitId: Joi.string().hex().length(24).optional(),

  employmentStatus: Joi.string()
    .valid("ACTIVE", "INACTIVE", "ON_LEAVE", "SUSPENDED", "TERMINATED")
    .optional(),

  status: Joi.string()
    .valid("PRESENT", "ABSENT", "HALF_DAY", "ON_LEAVE", "HOLIDAY", "WEEK_OFF")
    .optional(),

  search: Joi.string().trim().max(100).allow("").optional(),
});
