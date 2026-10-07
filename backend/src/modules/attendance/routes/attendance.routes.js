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
  getAttendanceDashboardController,
  getAttendanceDetailController,
} from "../controllers/attendance.controller.js";

const router = Router();

/* =========================================================
   AUTHENTICATION
========================================================= */

router.use(authenticate);

/* =========================================================
   EMPLOYEE ATTENDANCE
========================================================= */

/**
 * Employee Check-In
 *
 * POST
 * /api/v1/attendance/check-in
 */
router.post(
  "/check-in",

  authorize(PERMISSIONS.ATTENDANCE_CREATE),

  validate(checkInSchema),

  checkInController,
);

/**
 * Employee Check-Out
 *
 * POST
 * /api/v1/attendance/check-out
 */
router.post(
  "/check-out",

  authorize(PERMISSIONS.ATTENDANCE_CREATE),

  validate(checkOutSchema),

  checkOutController,
);

/**
 * Logged-in employee attendance history
 *
 * GET
 * /api/v1/attendance/my
 *
 * Optional query:
 *
 * ?startDate=2026-10-01
 * &endDate=2026-10-07
 */
router.get(
  "/my",

  authorize(PERMISSIONS.ATTENDANCE_READ),

  getMyAttendanceController,
);

/* =========================================================
   ADMIN ATTENDANCE DASHBOARD
========================================================= */

/**
 * Company attendance dashboard
 *
 * GET
 * /api/v1/attendance/admin
 *
 * Optional query:
 *
 * ?date=2026-10-07
 * &departmentId=...
 * &organizationUnitId=...
 * &employmentStatus=ACTIVE
 * &status=PRESENT
 * &search=john
 *
 * IMPORTANT:
 *
 * This route MUST appear before:
 *
 * /admin/:employeeId
 *
 * so "admin" is not interpreted as an employeeId.
 */
router.get(
  "/admin",

  authorize(PERMISSIONS.ATTENDANCE_READ),

  getAttendanceDashboardController,
);

/* =========================================================
   ADMIN ATTENDANCE DETAIL
========================================================= */

/**
 * Detailed attendance for one employee
 *
 * GET
 * /api/v1/attendance/admin/:employeeId
 *
 * Example:
 *
 * /api/v1/attendance/admin/68c123...?date=2026-10-07
 */
router.get(
  "/admin/:employeeId",

  authorize(PERMISSIONS.ATTENDANCE_READ),

  getAttendanceDetailController,
);

export default router;
