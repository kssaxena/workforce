import { Router } from "express";

import authenticate from "../../auth/middleware/authenticate.js";
import authorize from "../../rbac/middleware/authorize.js";

import { PERMISSIONS } from "../../rbac/constants/permission.js";

import { getDashboardOverviewController } from "../controllers/dashboard.controller.js";

const router = Router();

router.use(authenticate);

router.get(
  "/overview",
  authorize(PERMISSIONS.REPORT_READ),
  getDashboardOverviewController,
);

export default router;
