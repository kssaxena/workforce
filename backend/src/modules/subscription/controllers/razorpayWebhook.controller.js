import asyncHandler from "../../../core/middleware/asyncHandler.js";
import ApiError from "../../../core/errors/ApiError.js";
import RazorpayWebhookEvent from "../models/razorpayWebhookEvent.model.js";
import {
  fetchRazorpayPayment,
  verifyWebhookSignature,
} from "../services/razorpay.service.js";
import { activatePaidPlan } from "../services/payment.service.js";

export const razorpayWebhookController = asyncHandler(async (req, res) => {
  const signature = req.get("x-razorpay-signature");

  // This must be the original raw request body, not JSON.stringify(req.body).
  if (!verifyWebhookSignature(req.body, signature)) {
    throw new ApiError(400, "Invalid Razorpay webhook signature");
  }

  let event;

  try {
    event = JSON.parse(req.body.toString("utf8"));
  } catch {
    throw new ApiError(400, "Invalid webhook JSON");
  }

  if (!event.id || !event.event) {
    throw new ApiError(400, "Missing Razorpay event identifiers");
  }

  let eventRecord;

  try {
    eventRecord = await RazorpayWebhookEvent.create({
      eventId: event.id,
      eventType: event.event,
      status: "RECEIVED",
    });
  } catch (error) {
    if (error.code !== 11000) throw error;

    eventRecord = await RazorpayWebhookEvent.findOne({
      eventId: event.id,
    });

    // An already processed event can safely be acknowledged.
    if (
      eventRecord?.status === "PROCESSED" ||
      eventRecord?.status === "IGNORED"
    ) {
      return res.status(200).json({ received: true });
    }

    // A previous attempt may have failed before processing completed.
  }

  if (event.event !== "payment.captured") {
    await RazorpayWebhookEvent.updateOne(
      { eventId: event.id },
      { $set: { status: "IGNORED", processedAt: new Date() } },
    );

    return res.status(200).json({ received: true });
  }

  const paymentEntity = event.payload?.payment?.entity;

  if (!paymentEntity?.id || !paymentEntity?.order_id) {
    throw new ApiError(400, "Captured payment details are missing");
  }

  // Fetch current payment state from Razorpay as an additional check.
  const payment = await fetchRazorpayPayment(paymentEntity.id);

  if (
    payment.status !== "captured" ||
    payment.captured !== true ||
    payment.order_id !== paymentEntity.order_id
  ) {
    throw new ApiError(400, "Razorpay payment is not captured for this order");
  }

  await activatePaidPlan({
    orderId: payment.order_id,
    paymentId: payment.id,
    amountPaise: payment.amount,
    currency: payment.currency,
    // Webhooks have no logged-in actor; activation service uses requester.
  });

  await RazorpayWebhookEvent.updateOne(
    { eventId: event.id },
    {
      $set: {
        status: "PROCESSED",
        processedAt: new Date(),
        lastError: null,
      },
    },
  );

  return res.status(200).json({ received: true });
});
