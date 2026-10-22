import mongoose from "mongoose";
import ApiError from "../../../core/errors/ApiError.js";
import Company from "../../company/models/company.model.js";
import SubscriptionChangeRequest from "../models/subscriptionChangeRequest.model.js";
import { createAuditLog } from "../../audit/services/audit.service.js";

const PAID_REQUEST_STATUSES = ["PENDING_PAYMENT", "PAYMENT_VERIFICATION"];

const getExpiryDate = (start, billingCycle) => {
  const expiry = new Date(start);

  if (billingCycle === "ANNUAL") {
    expiry.setFullYear(expiry.getFullYear() + 1);
  } else {
    expiry.setMonth(expiry.getMonth() + 1);
  }

  return expiry;
};

export const activatePaidPlan = async ({
  orderId,
  paymentId,
  amountPaise,
  currency,
  actorId = null,
  ipAddress,
  userAgent,
}) => {
  const session = await mongoose.startSession();

  try {
    let result;

    await session.withTransaction(async () => {
      const request = await SubscriptionChangeRequest.findOne({
        razorpayOrderId: orderId,
      }).session(session);

      if (!request) {
        throw new ApiError(404, "Subscription payment order not found");
      }

      // Safe retry: the same captured payment already activated this request.
      if (request.status === "APPROVED") {
        if (request.razorpayPaymentId === paymentId) {
          result = {
            alreadyProcessed: true,
            requestId: request._id,
          };
          return;
        }

        throw new ApiError(
          409,
          "This upgrade request was already processed with another payment",
        );
      }

      if (!PAID_REQUEST_STATUSES.includes(request.status)) {
        throw new ApiError(409, "Upgrade request is not payable");
      }

      if (
        !request.amountPaise ||
        request.amountPaise !== amountPaise ||
        currency !== "INR"
      ) {
        throw new ApiError(400, "Payment amount or currency does not match");
      }

      if (
        request.razorpayPaymentId &&
        request.razorpayPaymentId !== paymentId
      ) {
        throw new ApiError(409, "A different payment is already attached");
      }

      const now = new Date();
      const expiresAt = getExpiryDate(now, request.billingCycle);

      // Claim the request inside the transaction to prevent double activation.
      const claimed = await SubscriptionChangeRequest.findOneAndUpdate(
        {
          _id: request._id,
          status: { $in: PAID_REQUEST_STATUSES },
          razorpayOrderId: orderId,
          $or: [
            { razorpayPaymentId: null },
            { razorpayPaymentId: { $exists: false } },
            { razorpayPaymentId: paymentId },
          ],
        },
        {
          $set: {
            status: "APPROVED",
            paymentStatus: "CAPTURED",
            razorpayPaymentId: paymentId,
            razorpaySignatureVerified: true,
            paymentProvider: "RAZORPAY",
            paidAt: now,
            processedAt: now,
            processedBy: actorId || request.requestedBy,
          },
        },
        { new: true, session },
      );

      if (!claimed) {
        // A concurrent callback may have completed the request.
        const latest = await SubscriptionChangeRequest.findById(
          request._id,
        ).session(session);

        if (
          latest?.status === "APPROVED" &&
          latest.razorpayPaymentId === paymentId
        ) {
          result = {
            alreadyProcessed: true,
            requestId: latest._id,
          };
          return;
        }

        throw new ApiError(409, "Upgrade request was processed concurrently");
      }

      const company = await Company.findOneAndUpdate(
        {
          _id: request.companyId,
          status: "ACTIVE",
        },
        {
          $set: {
            "subscription.plan": request.requestedPlan,
            "subscription.status": "ACTIVE",
            "subscription.billingCycle": request.billingCycle,
            "subscription.startsAt": now,
            "subscription.expiresAt": expiresAt,
            "subscription.paymentProvider": "RAZORPAY",
            "subscription.lastPaymentId": paymentId,
            "subscription.lastPaymentAt": now,
          },
        },
        { new: true, session },
      );

      if (!company) {
        throw new ApiError(404, "Active company not found");
      }

      await createAuditLog({
        companyId: request.companyId,
        actorId: actorId || request.requestedBy,
        action: "SUBSCRIPTION_PLAN_ACTIVATED",
        module: "subscription",
        entityType: "SubscriptionChangeRequest",
        entityId: request._id,
        description: `Subscription activated: ${request.requestedPlan}`,
        before: {
          plan: request.currentPlan,
        },
        after: {
          plan: request.requestedPlan,
          status: "ACTIVE",
          billingCycle: request.billingCycle,
          startsAt: now,
          expiresAt,
          paymentId,
          orderId,
        },
        metadata: {
          paymentProvider: "RAZORPAY",
          amountPaise,
          currency,
        },
        ipAddress,
        userAgent,
        session,
      });

      result = {
        alreadyProcessed: false,
        requestId: request._id,
        plan: request.requestedPlan,
        status: "ACTIVE",
        billingCycle: request.billingCycle,
        startsAt: now,
        expiresAt,
      };
    });

    return result;
  } finally {
    await session.endSession();
  }
};
