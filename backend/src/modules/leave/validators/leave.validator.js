import Joi from "joi";

const date = Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/);

export const createLeaveTypeSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),

  code: Joi.string()
    .trim()
    .uppercase()
    .pattern(/^[A-Z0-9_]+$/)
    .max(30)
    .required(),

  description: Joi.string().trim().max(500).allow("", null),

  annualDays: Joi.number().min(0).max(366).required(),

  isPaid: Joi.boolean().default(true),

  requiresApproval: Joi.boolean().default(true),

  allowHalfDay: Joi.boolean().default(true),

  allowNegativeBalance: Joi.boolean().default(false),

  carryForward: Joi.boolean().default(false),

  maxCarryForwardDays: Joi.number().min(0).max(366).default(0),
});

export const updateLeaveTypeSchema = createLeaveTypeSchema
  .fork(["name", "code", "annualDays"], (schema) => schema.optional())
  .keys({
    isActive: Joi.boolean(),
  })
  .min(1);

export const createLeaveRequestSchema = Joi.object({
  leaveTypeId: Joi.string().hex().length(24).required(),

  startDate: date.required(),

  endDate: date.required(),

  totalDays: Joi.number().min(0.5).max(366).required(),

  reason: Joi.string().trim().max(1000).allow("", null),
});

export const decisionSchema = Joi.object({
  decisionReason: Joi.string().trim().max(1000).allow("", null),
}).default({});
