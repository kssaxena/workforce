import { Router } from "express";

import authenticate from "../../auth/middleware/authenticate.js";
import authorize from "../../rbac/middleware/authorize.js";
import { PERMISSIONS } from "../../rbac/constants/permission.js";

import {
  getAvailablePlansController,
  getCurrentSubscriptionController,
} from "../controllers/subscription.controller.js";

import validate from "../../../core/middleware/validate.js";

import { createUpgradeRequestSchema } from "../validators/subscription.validator.js";

import {
  createUpgradeRequestController,
  getCompanyUpgradeRequestsController,
} from "../controllers/upgradeRequest.controller.js";

import {
  createPaymentOrderController,
  verifyPaymentController,
} from "../controllers/payment.controller.js";

import {
  createPaymentOrderSchema,
  verifyPaymentSchema,
} from "../validators/payment.validator.js";

import { razorpayWebhookController } from "../controllers/razorpayWebhook.controller.js";

const router = Router();

// Public pricing catalogue.
router.get("/plans", getAvailablePlansController);

// Razorpay authenticates this route with its webhook signature.
// Do not add user authentication to this endpoint.
router.post("/webhook/razorpay", razorpayWebhookController);

router.post(
  "/payment/order",
  authenticate,
  authorize(PERMISSIONS.COMPANY_UPDATE),
  validate(createPaymentOrderSchema),
  createPaymentOrderController,
);

router.post(
  "/payment/verify",
  authenticate,
  authorize(PERMISSIONS.COMPANY_UPDATE),
  validate(verifyPaymentSchema),
  verifyPaymentController,
);

// Company-specific subscription and seat usage.
router.get(
  "/current",
  authenticate,
  authorize(PERMISSIONS.COMPANY_READ),
  getCurrentSubscriptionController,
);

router.post(
  "/upgrade-requests",
  authenticate,
  authorize(PERMISSIONS.COMPANY_UPDATE),
  validate(createUpgradeRequestSchema),
  createUpgradeRequestController,
);

router.get(
  "/upgrade-requests",
  authenticate,
  authorize(PERMISSIONS.COMPANY_READ),
  getCompanyUpgradeRequestsController,
);

export default router;
