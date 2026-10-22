import Joi from "joi";

export const createPaymentOrderSchema = Joi.object({
  requestId: Joi.string().hex().length(24).required(),
}).unknown(false);

export const verifyPaymentSchema = Joi.object({
  requestId: Joi.string().hex().length(24).required(),
  razorpay_order_id: Joi.string().required(),
  razorpay_payment_id: Joi.string().required(),
  razorpay_signature: Joi.string().hex().length(64).required(),
}).unknown(false);
