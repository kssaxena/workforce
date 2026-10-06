import { Router } from "express";

import authenticate from "../../auth/middleware/authenticate.js";
import authorize from "../../rbac/middleware/authorize.js";

import { PERMISSIONS } from "../../rbac/constants/permission.js";

import validate from "../../../core/middleware/validate.js";

import {
  checkInSchema,
  checkOutSchema,
} from "../validators/attendance.validator.js";

import {
  checkInController,
  checkOutController,
  getMyAttendanceController,
  getCompanyAttendanceController,
  getAttendanceSummaryController,
} from "../controllers/attendance.controller.js";

const router = Router();

router.use(authenticate);

router.post(
  "/check-in",
  authorize(PERMISSIONS.ATTENDANCE_CREATE),
  validate(checkInSchema),
  checkInController,
);

router.post(
  "/check-out",
  authorize(PERMISSIONS.ATTENDANCE_CREATE),
  validate(checkOutSchema),
  checkOutController,
);

router.get(
  "/my",
  authorize(PERMISSIONS.ATTENDANCE_READ),
  getMyAttendanceController,
);

router.get(
  "/summary",
  authorize(PERMISSIONS.ATTENDANCE_READ),
  getAttendanceSummaryController,
);

router.get(
  "/company",
  authorize(PERMISSIONS.ATTENDANCE_READ),
  getCompanyAttendanceController,
);

export default router;
