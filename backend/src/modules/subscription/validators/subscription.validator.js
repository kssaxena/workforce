import Joi from "joi";

export const createUpgradeRequestSchema = Joi.object({
  requestedPlan: Joi.string()
    .valid("BEGINNER", "INTERMEDIATE", "PRO")
    .required(),

  billingCycle: Joi.string().valid("MONTHLY", "ANNUAL").required(),
}).unknown(false);
