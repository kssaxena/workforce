import { Router } from "express";

import authenticate from "../../auth/middleware/authenticate.js";
import authorize from "../../rbac/middleware/authorize.js";

import { PERMISSIONS } from "../../rbac/constants/permission.js";

import validate from "../../../core/middleware/validate.js";

import {
  checkInSchema,
  checkOutSchema,
  regularizeAttendanceSchema,
  reviewAttendanceRegularizationSchema,
} from "../validators/attendance.validator.js";

import {
  checkInController,
  checkOutController,
  getMyAttendanceController,
  getCompanyAttendanceController,
  getAttendanceSummaryController,
  regularizeAttendanceController,
  createAttendanceRegularizationController,
  getMyAttendanceRegularizationController,
  getCompanyAttendanceRegularizationController,
  reviewAttendanceRegularizationController,
} from "../controllers/attendance.controller.js";

import { createAttendanceRegularizationSchema } from "../validators/attendance.validator.js";

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

router.patch(
  "/regularize",
  authorize(PERMISSIONS.ATTENDANCE_UPDATE),
  validate(regularizeAttendanceSchema),
  regularizeAttendanceController,
);

router.post(
  "/regularization-requests",
  authorize(PERMISSIONS.ATTENDANCE_CREATE),
  validate(createAttendanceRegularizationSchema),
  createAttendanceRegularizationController,
);

router.get(
  "/regularization-requests/my",
  authorize(PERMISSIONS.ATTENDANCE_READ),
  getMyAttendanceRegularizationController,
);

router.get(
  "/regularization-requests",
  authorize(PERMISSIONS.ATTENDANCE_APPROVE),
  getCompanyAttendanceRegularizationController,
);

router.patch(
  "/regularization-requests/:requestId/review",
  authorize(PERMISSIONS.ATTENDANCE_APPROVE),
  validate(reviewAttendanceRegularizationSchema),
  reviewAttendanceRegularizationController,
);

export default router;
