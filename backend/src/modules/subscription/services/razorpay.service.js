import Razorpay from "razorpay";
import ApiError from "../../../core/errors/ApiError.js";
import crypto from "node:crypto";

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

const getClient = () => {
  if (!keyId || !keySecret) {
    throw new ApiError(500, "Razorpay is not configured");
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
};

export const createRazorpayOrder = async ({
  amountPaise,
  requestId,
  companyId,
  plan,
  billingCycle,
}) => {
  if (!Number.isSafeInteger(amountPaise) || amountPaise < 100) {
    throw new ApiError(400, "Invalid payment amount");
  }

  return getClient().orders.create({
    amount: amountPaise,
    currency: "INR",
    receipt: `sub_${String(requestId).slice(-30)}`,
    notes: {
      requestId: String(requestId),
      companyId: String(companyId),
      plan,
      billingCycle,
    },
  });
};

export const fetchRazorpayPayment = async (paymentId) => {
  if (!paymentId) {
    throw new ApiError(400, "Payment ID is required");
  }

  return getClient().payments.fetch(paymentId);
};

export const verifyCheckoutSignature = ({ orderId, paymentId, signature }) => {
  const crypto = requireCrypto();

  if (!orderId || !paymentId || !signature || !keySecret) {
    return false;
  }

  const expected = crypto
    .createHmac("sha256", keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest();

  let received;

  try {
    received = Buffer.from(signature, "hex");
  } catch {
    return false;
  }

  return (
    received.length === expected.length &&
    crypto.timingSafeEqual(received, expected)
  );
};

export const verifyWebhookSignature = (rawBody, signature) => {
  const crypto = requireCrypto();
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!Buffer.isBuffer(rawBody) || !signature || !webhookSecret) {
    return false;
  }

  const expected = crypto
    .createHmac("sha256", webhookSecret)
    .update(rawBody)
    .digest();

  let received;

  try {
    received = Buffer.from(signature, "hex");
  } catch {
    return false;
  }

  return (
    received.length === expected.length &&
    crypto.timingSafeEqual(received, expected)
  );
};

// function requireCrypto() {
//   // Node's built-in crypto module; no separate package needed.
//   return globalThis.__unusedCrypto || cryptoModule;
// }

import * as cryptoModule from "node:crypto";
