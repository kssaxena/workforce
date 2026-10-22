import ApiError from "../../../core/errors/ApiError.js";
import ApiResponse from "../../../core/utils/ApiResponse.js";
import asyncHandler from "../../../core/middleware/asyncHandler.js";
import SubscriptionChangeRequest from "../models/subscriptionChangeRequest.model.js";
import {
  createRazorpayOrder,
  fetchRazorpayPayment,
  verifyCheckoutSignature,
} from "../services/razorpay.service.js";
import { activatePaidPlan } from "../services/payment.service.js";

export const createPaymentOrderController = asyncHandler(async (req, res) => {
  const { requestId } = req.body;

  const request = await SubscriptionChangeRequest.findOne({
    _id: requestId,
    companyId: req.user.companyId,
    status: "PENDING_PAYMENT",
  });

  if (!request) {
    throw new ApiError(
      404,
      "Pending upgrade request not found for this company",
    );
  }

  // Reuse an existing order when the client retries the request.
  if (request.razorpayOrderId) {
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          requestId: request._id,
          orderId: request.razorpayOrderId,
          amount: request.amountPaise,
          currency: "INR",
          keyId: process.env.RAZORPAY_KEY_ID,
        },
        "Existing payment order returned",
      ),
    );
  }

  const amountPaise = Math.round(Number(request.estimatedTotal) * 100);

  if (!Number.isSafeInteger(amountPaise) || amountPaise < 100) {
    throw new ApiError(400, "Invalid subscription amount");
  }

  const order = await createRazorpayOrder({
    amountPaise,
    requestId: request._id,
    companyId: request.companyId,
    plan: request.requestedPlan,
    billingCycle: request.billingCycle,
  });

  request.razorpayOrderId = order.id;
  request.amountPaise = order.amount;
  request.paymentStatus = "CREATED";
  request.paymentProvider = "RAZORPAY";

  await request.save();

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        requestId: request._id,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
      },
      "Payment order created",
    ),
  );
});

export const verifyPaymentController = asyncHandler(async (req, res) => {
  const {
    requestId,
    razorpay_order_id: submittedOrderId,
    razorpay_payment_id: paymentId,
    razorpay_signature: signature,
  } = req.body;

  const request = await SubscriptionChangeRequest.findOne({
    _id: requestId,
    companyId: req.user.companyId,
  });

  if (!request || !request.razorpayOrderId) {
    throw new ApiError(404, "Payment order not found");
  }

  // Never trust the order ID supplied by the browser on its own.
  if (submittedOrderId !== request.razorpayOrderId) {
    throw new ApiError(400, "Payment order does not match the request");
  }

  const validSignature = verifyCheckoutSignature({
    orderId: request.razorpayOrderId,
    paymentId,
    signature,
  });

  if (!validSignature) {
    throw new ApiError(400, "Invalid Razorpay payment signature");
  }

  // Fetch the payment from Razorpay; don't trust the browser's status.
  const payment = await fetchRazorpayPayment(paymentId);

  if (
    payment.order_id !== request.razorpayOrderId ||
    payment.amount !== request.amountPaise ||
    payment.currency !== "INR"
  ) {
    throw new ApiError(400, "Payment details do not match the order");
  }

  if (payment.status !== "captured" || payment.captured !== true) {
    request.paymentStatus =
      payment.status === "authorized" ? "AUTHORIZED" : "FAILED";
    await request.save();

    throw new ApiError(
      409,
      "Payment is not captured yet. The subscription has not been activated.",
    );
  }

  const result = await activatePaidPlan({
    orderId: payment.order_id,
    paymentId: payment.id,
    amountPaise: payment.amount,
    currency: payment.currency,
    actorId: req.user.userId,
    ipAddress: req.ip,
    userAgent: req.get("user-agent"),
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        result,
        result.alreadyProcessed
          ? "Payment was already processed"
          : "Payment verified and subscription activated",
      ),
    );
});
