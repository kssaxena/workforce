import { Router } from "express";

import authenticate from "../../auth/middleware/authenticate.js";
import authorize from "../../rbac/middleware/authorize.js";
import { PERMISSIONS } from "../../rbac/constants/permission.js";

import {
  getAvailablePlansController,
  getCurrentSubscriptionController,
} from "../controllers/subscription.controller.js";

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

export default router;
