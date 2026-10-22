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

const router = Router();

// Public pricing catalogue.
router.get("/plans", getAvailablePlansController);

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
