import { Router } from "express";

import authenticate from "../../auth/middleware/authenticate.js";
import authorize from "../../rbac/middleware/authorize.js";

import { PERMISSIONS } from "../../rbac/constants/permission.js";

import {
  getAuditLogsController,
  getAuditLogController,
} from "../controllers/audit.controller.js";

import requireFeature from "../../subscription/middleware/requireFeature.js";

const router = Router();

router.use(authenticate);

router.get(
  "/",
  authorize(PERMISSIONS.AUDIT_READ),
  requireFeature("auditLogAccess"),
  getAuditLogsController,
);

router.get(
  "/:auditLogId",
  authorize(PERMISSIONS.AUDIT_READ),
  requireFeature("auditLogAccess"),
  getAuditLogController,
);

export default router;
