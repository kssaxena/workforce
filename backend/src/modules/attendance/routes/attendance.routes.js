import { Router } from "express";
import authenticate from "../../auth/middleware/authenticate.js";
import authorize from "../../rbac/middleware/authorize.js";
import { PERMISSIONS } from "../../rbac/constants/permission.js";
import validate from "../../../core/middleware/validate.js";
import {
  checkInSchema,
  checkOutSchema,
  createAttendanceRegularizationSchema,
  reviewAttendanceRegularizationSchema,
} from "../validators/attendance.validator.js";
import {
  checkInController,
  checkOutController,
  getMyAttendanceController,
  getAttendanceDashboardController,
  getAttendanceDetailController,
  createAttendanceRegularizationController,
  getMyAttendanceRegularizationController,
  getCompanyAttendanceRegularizationController,
  reviewAttendanceRegularizationController,
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

router.post(
  "/regularization",
  authorize(PERMISSIONS.ATTENDANCE_CREATE),
  validate(createAttendanceRegularizationSchema),
  createAttendanceRegularizationController,
);

router.get(
  "/regularization/my",
  authorize(PERMISSIONS.ATTENDANCE_READ),
  getMyAttendanceRegularizationController,
);

router.get(
  "/regularization/admin",
  authorize(PERMISSIONS.ATTENDANCE_READ),
  getCompanyAttendanceRegularizationController,
);

router.patch(
  "/regularization/:requestId/review",
  authorize(PERMISSIONS.ATTENDANCE_APPROVE),
  validate(reviewAttendanceRegularizationSchema),
  reviewAttendanceRegularizationController,
);

router.get(
  "/admin",
  authorize(PERMISSIONS.ATTENDANCE_READ),
  getAttendanceDashboardController,
);

router.get(
  "/admin/:employeeId",
  authorize(PERMISSIONS.ATTENDANCE_READ),
  getAttendanceDetailController,
);

export default router;
