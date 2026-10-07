import asyncHandler from "../../../core/middleware/asyncHandler.js";
import ApiResponse from "../../../core/utils/ApiResponse.js";

import Company from "../../company/models/company.model.js";
import Employee from "../../employee/models/employee.model.js";

import { checkIn, checkOut } from "../services/attendance.service.js";

import { getEmployeeAttendance } from "../services/attendanceQuery.service.js";

import {
  getAttendanceDashboard,
  getAttendanceDetail,
} from "../services/attendanceAdmin.service.js";

import {
  createAttendanceRegularizationRequest,
  getMyAttendanceRegularizationRequests,
  getCompanyAttendanceRegularizationRequests,
  reviewAttendanceRegularization,
} from "../services/attendanceRegularizationRequest.service.js";

/**
 * Employee check-in
 */
export const checkInController = asyncHandler(async (req, res) => {
  const attendance = await checkIn({
    userId: req.user.userId,
    companyId: req.user.companyId,

    latitude: req.body.latitude,
    longitude: req.body.longitude,
    accuracy: req.body.accuracy,

    source: req.body.source || "WEB",
  });

  return res
    .status(201)
    .json(new ApiResponse(201, attendance, "Check-in successful"));
});

/**
 * Employee check-out
 */
export const checkOutController = asyncHandler(async (req, res) => {
  const attendance = await checkOut({
    userId: req.user.userId,
    companyId: req.user.companyId,

    latitude: req.body.latitude,
    longitude: req.body.longitude,
    accuracy: req.body.accuracy,

    source: req.body.source || "WEB",
  });

  return res
    .status(200)
    .json(new ApiResponse(200, attendance, "Check-out successful"));
});

/**
 * Get logged-in employee's attendance history.
 */
export const getMyAttendanceController = asyncHandler(async (req, res) => {
  /*
   * -----------------------------------------------------
   * Find employee profile belonging to logged-in user
   * -----------------------------------------------------
   */

  const employee = await Employee.findOne({
    userId: req.user.userId,
    companyId: req.user.companyId,
    isActive: true,
  }).select("_id");

  if (!employee) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, "Employee profile not found"));
  }

  /*
   * -----------------------------------------------------
   * Get company timezone
   * -----------------------------------------------------
   */

  const company = await Company.findById(req.user.companyId).select(
    "settings.timezone",
  );

  if (!company) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, "Company not found"));
  }

  const timezone = company.settings?.timezone || "Asia/Kolkata";

  /*
   * -----------------------------------------------------
   * Fetch attendance history
   * -----------------------------------------------------
   */

  const attendance = await getEmployeeAttendance({
    employeeId: employee._id,

    companyId: req.user.companyId,

    startDate: req.query.startDate,

    endDate: req.query.endDate,

    timezone,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        attendance,
        "Attendance history fetched successfully",
      ),
    );
});

/* =========================================================
   ADMIN ATTENDANCE DASHBOARD
========================================================= */

/**
 * Get company attendance dashboard.
 *
 * Used by:
 * - HR Admin
 * - Company Admin
 * - Managers / Team Leaders
 *
 * Visibility is handled inside the attendance admin service
 * using the employee organization scope.
 */
export const getAttendanceDashboardController = asyncHandler(
  async (req, res) => {
    /*
     * -----------------------------------------------------
     * Company timezone
     * -----------------------------------------------------
     */

    const company = await Company.findById(req.user.companyId).select(
      "settings.timezone",
    );

    if (!company) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Company not found"));
    }

    const timezone = company.settings?.timezone || "Asia/Kolkata";

    /*
     * -----------------------------------------------------
     * Fetch dashboard
     * -----------------------------------------------------
     */

    const dashboard = await getAttendanceDashboard({
      userId: req.user.userId,

      companyId: req.user.companyId,

      date: req.query.date,

      departmentId: req.query.departmentId,

      organizationUnitId: req.query.organizationUnitId,

      employmentStatus: req.query.employmentStatus,

      status: req.query.status,

      search: req.query.search,

      timezone,
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          dashboard,
          "Attendance dashboard fetched successfully",
        ),
      );
  },
);

/* =========================================================
   ADMIN ATTENDANCE DETAIL
========================================================= */

/**
 * Get detailed attendance information for one employee.
 *
 * Example:
 *
 * GET
 * /attendance/admin/:employeeId?date=2026-10-07
 *
 * The service also validates whether the logged-in user
 * is allowed to view this employee.
 */
export const getAttendanceDetailController = asyncHandler(async (req, res) => {
  /*
   * -----------------------------------------------------
   * Get company timezone
   * -----------------------------------------------------
   */

  const company = await Company.findById(req.user.companyId).select(
    "settings.timezone",
  );

  if (!company) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, "Company not found"));
  }

  const timezone = company.settings?.timezone || "Asia/Kolkata";

  /*
   * -----------------------------------------------------
   * Fetch employee attendance detail
   * -----------------------------------------------------
   */

  const detail = await getAttendanceDetail({
    userId: req.user.userId,

    companyId: req.user.companyId,

    employeeId: req.params.employeeId,

    date: req.query.date,

    timezone,
  });

  /*
   * -----------------------------------------------------
   * Employee not found / outside visibility scope
   * -----------------------------------------------------
   */

  if (!detail) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, "Employee attendance record not found"));
  }

  /*
   * -----------------------------------------------------
   * Success
   * -----------------------------------------------------
   */

  return res
    .status(200)
    .json(
      new ApiResponse(200, detail, "Attendance detail fetched successfully"),
    );
});

/* =========================================================
   ATTENDANCE REGULARIZATION
========================================================= */

/**
 * Employee creates an attendance regularization request.
 *
 * POST
 * /api/v1/attendance/regularization
 */
export const createAttendanceRegularizationController = asyncHandler(
  async (req, res) => {
    const request = await createAttendanceRegularizationRequest({
      userId: req.user.userId,
      companyId: req.user.companyId,

      date: req.body.date,
      requestedStatus: req.body.requestedStatus,

      requestedCheckIn: req.body.requestedCheckIn,
      requestedCheckOut: req.body.requestedCheckOut,

      reason: req.body.reason,
    });

    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          request,
          "Attendance regularization request created successfully",
        ),
      );
  },
);

/**
 * Get regularization requests created by
 * the currently logged-in employee.
 *
 * GET
 * /api/v1/attendance/regularization/my
 *
 * Optional:
 * ?status=PENDING
 */
export const getMyAttendanceRegularizationController = asyncHandler(
  async (req, res) => {
    const requests = await getMyAttendanceRegularizationRequests({
      userId: req.user.userId,
      companyId: req.user.companyId,
      status: req.query.status,
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          requests,
          "Attendance regularization requests fetched successfully",
        ),
      );
  },
);

/**
 * Get company attendance regularization requests.
 *
 * Used by:
 * - HR Admin
 * - Company Admin
 * - authorized reviewers
 *
 * GET
 * /api/v1/attendance/regularization/admin
 *
 * Optional:
 *
 * ?status=PENDING
 * ?employeeId=...
 */
export const getCompanyAttendanceRegularizationController = asyncHandler(
  async (req, res) => {
    const requests = await getCompanyAttendanceRegularizationRequests({
      companyId: req.user.companyId,

      status: req.query.status,

      employeeId: req.query.employeeId,
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          requests,
          "Attendance regularization requests fetched successfully",
        ),
      );
  },
);

/**
 * Approve or reject an attendance regularization request.
 *
 * PATCH
 * /api/v1/attendance/regularization/:requestId/review
 *
 * Body:
 *
 * {
 *   "decision": "APPROVED",
 *   "reviewRemarks": "Approved after verification"
 * }
 */
export const reviewAttendanceRegularizationController = asyncHandler(
  async (req, res) => {
    const result = await reviewAttendanceRegularization({
      requestId: req.params.requestId,

      companyId: req.user.companyId,

      reviewerId: req.user.userId,

      decision: req.body.decision,

      reviewRemarks: req.body.reviewRemarks,
    });

    const message =
      req.body.decision === "APPROVED"
        ? "Attendance regularization approved successfully"
        : "Attendance regularization rejected successfully";

    return res.status(200).json(new ApiResponse(200, result, message));
  },
);
