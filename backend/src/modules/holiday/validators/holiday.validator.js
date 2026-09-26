import Joi from "joi";

export const createHolidaySchema = Joi.object({
  name: Joi.string().trim().min(2).max(150).required(),
  date: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .required(),
  description: Joi.string().trim().max(1000).allow("", null),
  type: Joi.string()
    .valid("PUBLIC", "NATIONAL", "FESTIVAL", "COMPANY", "OPTIONAL")
    .default("COMPANY"),
  isOptional: Joi.boolean().default(false),
});

export const updateHolidaySchema = Joi.object({
  name: Joi.string().trim().min(2).max(150),
  date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/),
  description: Joi.string().trim().max(1000).allow("", null),
  type: Joi.string().valid(
    "PUBLIC",
    "NATIONAL",
    "FESTIVAL",
    "COMPANY",
    "OPTIONAL",
  ),
  isOptional: Joi.boolean(),
  isActive: Joi.boolean(),
}).min(1);
