import { Router } from "express";

import authenticate from "../../auth/middleware/authenticate.js";
import authorize from "../../rbac/middleware/authorize.js";

import { PERMISSIONS } from "../../rbac/constants/permission.js";

import {
  getAuditLogsController,
  getAuditLogController,
} from "../controllers/audit.controller.js";

const router = Router();

router.use(authenticate);

router.get("/", authorize(PERMISSIONS.ATTENDANCE_READ), getAuditLogsController);

router.get(
  "/:auditLogId",
  authorize(PERMISSIONS.ATTENDANCE_READ),
  getAuditLogController,
);

export default router;
