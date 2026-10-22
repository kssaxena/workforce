import Joi from "joi";

export const createOrganizationUnitSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),

  code: Joi.string().trim().uppercase().min(2).max(30).required(),

  description: Joi.string().trim().max(500).allow("", null),

  parentUnitId: Joi.string().hex().length(24).allow(null),
}).unknown(false);

export const updateOrganizationUnitSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100),

  code: Joi.string().trim().uppercase().min(2).max(30),

  description: Joi.string().trim().max(500).allow("", null),

  parentUnitId: Joi.string().hex().length(24).allow(null),

  isActive: Joi.boolean(),
})
  .min(1)
  .unknown(false);
