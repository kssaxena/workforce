import Joi from "joi";

export const createOrganizationUnitSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),

  code: Joi.string().trim().uppercase().min(2).max(30).required(),

  description: Joi.string().trim().max(500).allow("", null),

  parentUnitId: Joi.string().hex().length(24).allow(null),

  level: Joi.number().integer().min(0).default(0),
});

export const updateOrganizationUnitSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100),

  code: Joi.string().trim().uppercase().min(2).max(30),

  description: Joi.string().trim().max(500).allow("", null),

  parentUnitId: Joi.string().hex().length(24).allow(null),

  level: Joi.number().integer().min(0),

  isActive: Joi.boolean(),
}).min(1);
