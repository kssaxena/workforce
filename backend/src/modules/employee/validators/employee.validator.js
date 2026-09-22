import Joi from "joi";

export const createEmployeeSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required(),

  phone: Joi.string().trim().min(7).max(20).required(),

  password: Joi.string().min(8).max(128).required(),

  firstName: Joi.string().trim().min(2).max(100).required(),

  lastName: Joi.string().trim().max(100).allow("", null),

  employeeCode: Joi.string().trim().uppercase().min(2).max(50).required(),

  dateOfBirth: Joi.date().iso().allow(null),

  gender: Joi.string()
    .valid("MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY")
    .allow(null),

  joiningDate: Joi.date().iso().required(),

  employmentType: Joi.string()
    .valid("FULL_TIME", "PART_TIME", "CONTRACT", "INTERN", "TEMPORARY")
    .default("FULL_TIME"),

  designation: Joi.string().trim().max(150).allow("", null),

  departmentId: Joi.string().hex().length(24).allow(null),

  organizationUnitId: Joi.string().hex().length(24).allow(null),

  reportsTo: Joi.string().hex().length(24).allow(null),

  roleId: Joi.string().hex().length(24).required(),

  contact: Joi.object({
    alternatePhone: Joi.string().trim().max(20).allow("", null),

    personalEmail: Joi.string().email().lowercase().trim().allow("", null),

    workEmail: Joi.string().email().lowercase().trim().allow("", null),
  }),

  address: Joi.object({
    addressLine1: Joi.string().trim().max(200).allow("", null),

    addressLine2: Joi.string().trim().max(200).allow("", null),

    city: Joi.string().trim().max(100).allow("", null),

    state: Joi.string().trim().max(100).allow("", null),

    country: Joi.string().trim().max(100).default("India"),

    postalCode: Joi.string().trim().max(20).allow("", null),

    latitude: Joi.number().min(-90).max(90).allow(null),

    longitude: Joi.number().min(-180).max(180).allow(null),
  }),
});
