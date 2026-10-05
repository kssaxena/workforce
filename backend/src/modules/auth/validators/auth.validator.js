import Joi from "joi";

export const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),

  password: Joi.string().required(),

  companyId: Joi.string().hex().length(24).allow(null, ""),

  portal: Joi.string()
    .valid("company", "companyTeam", "manager", "employee")
    .required(),
});
