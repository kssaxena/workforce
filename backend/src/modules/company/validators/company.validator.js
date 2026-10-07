import Joi from "joi";

const addressSchema = Joi.object({
  addressLine1: Joi.string().trim().required(),
  addressLine2: Joi.string().trim().allow("", null),
  city: Joi.string().trim().required(),
  state: Joi.string().trim().required(),
  country: Joi.string().trim().default("India"),
  postalCode: Joi.string().trim().required(),
  latitude: Joi.number().optional(),
  longitude: Joi.number().optional(),
});

export const registerCompanySchema = Joi.object({
  company: Joi.object({
    name: Joi.string().trim().min(2).max(150).required(),

    legalName: Joi.string().trim().max(200).allow("", null),

    registrationNumber: Joi.string().trim().max(100).allow("", null),

    email: Joi.string().email().lowercase().required(),

    phone: Joi.string().trim().required(),

    website: Joi.string().uri().allow("", null),

    address: addressSchema.required(),
  }).required(),

  representative: Joi.object({
    firstName: Joi.string().trim().min(2).max(100).required(),

    lastName: Joi.string().trim().max(100).allow("", null),

    email: Joi.string().email().lowercase().required(),

    phone: Joi.string().trim().required(),

    password: Joi.string().min(8).max(128).required(),

    designation: Joi.string().trim().max(100).allow("", null),
  }).required(),
});

export const updateAttendanceSettingsSchema = Joi.object({
  attendanceEnabled: Joi.boolean(),

  gpsAttendanceEnabled: Joi.boolean(),

  attendanceRadius: Joi.number().integer().min(50).max(5000),

  attendanceLocation: Joi.object({
    latitude: Joi.number().min(-90).max(90).required(),

    longitude: Joi.number().min(-180).max(180).required(),
  }).allow(null),
}).min(1);
