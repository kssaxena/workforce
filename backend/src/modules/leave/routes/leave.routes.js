import express from "express";

import authenticate from "../../auth/middleware/authenticate.js";
import authorize from "../../rbac/middleware/authorize.js";

import validate from "../../../core/middleware/validate.js";

import { PERMISSIONS } from "../../rbac/constants/permission.js";

import {
  createLeaveTypeController,
  getLeaveTypesController,
  updateLeaveTypeController,
  createLeaveRequestController,
  getMyLeaveRequestsController,
  getLeaveBalancesController,
  getPendingLeaveRequestsController,
  approveLeaveRequestController,
  rejectLeaveRequestController,
  cancelLeaveRequestController,
} from "../controllers/leave.controller.js";

import {
  createLeaveTypeSchema,
  updateLeaveTypeSchema,
  createLeaveRequestSchema,
  decisionSchema,
} from "../validators/leave.validator.js";

const router = express.Router();

router.use(authenticate);

/* =========================================================
   LEAVE TYPES
========================================================= */

router.post(
  "/types",
  authorize(PERMISSIONS.LEAVE_UPDATE),
  validate(createLeaveTypeSchema),
  createLeaveTypeController,
);

router.get(
  "/types",
  authorize(PERMISSIONS.LEAVE_READ),
  getLeaveTypesController,
);

router.patch(
  "/types/:leaveTypeId",
  authorize(PERMISSIONS.LEAVE_UPDATE),
  validate(updateLeaveTypeSchema),
  updateLeaveTypeController,
);

/* =========================================================
   LEAVE REQUESTS
========================================================= */

router.post(
  "/requests",
  authorize(PERMISSIONS.LEAVE_CREATE),
  validate(createLeaveRequestSchema),
  createLeaveRequestController,
);

router.get(
  "/requests/me",
  authorize(PERMISSIONS.LEAVE_READ),
  getMyLeaveRequestsController,
);

router.get(
  "/balances/me",
  authorize(PERMISSIONS.LEAVE_READ),
  getLeaveBalancesController,
);

router.get(
  "/requests/pending",
  authorize(PERMISSIONS.LEAVE_APPROVE),
  getPendingLeaveRequestsController,
);

router.post(
  "/requests/:leaveRequestId/approve",
  authorize(PERMISSIONS.LEAVE_APPROVE),
  validate(decisionSchema),
  approveLeaveRequestController,
);

router.post(
  "/requests/:leaveRequestId/reject",
  authorize(PERMISSIONS.LEAVE_APPROVE),
  validate(decisionSchema),
  rejectLeaveRequestController,
);

router.post(
  "/requests/:leaveRequestId/cancel",
  authorize(PERMISSIONS.LEAVE_CREATE),
  cancelLeaveRequestController,
);

export default router;
