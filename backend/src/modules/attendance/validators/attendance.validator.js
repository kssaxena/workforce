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
