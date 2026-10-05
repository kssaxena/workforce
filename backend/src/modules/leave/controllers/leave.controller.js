import asyncHandler from "../../../core/middleware/asyncHandler.js";
import ApiResponse from "../../../core/utils/ApiResponse.js";

import {
  createLeaveType,
  getLeaveTypes,
  updateLeaveType,
  createLeaveRequest,
  getMyLeaveRequests,
  getLeaveBalances,
  getPendingLeaveRequests,
  decideLeaveRequest,
  cancelLeaveRequest,
} from "../services/leave.service.js";

/* =========================================================
   LEAVE TYPES
========================================================= */

export const createLeaveTypeController = asyncHandler(async (req, res) => {
  const result = await createLeaveType({
    companyId: req.user.companyId,

    userId: req.user.userId,

    data: req.body,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, result, "Leave type created successfully"));
});

export const getLeaveTypesController = asyncHandler(async (req, res) => {
  const result = await getLeaveTypes({
    companyId: req.user.companyId,

    includeInactive: req.query.includeInactive === "true",
  });

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Leave types fetched successfully"));
});

export const updateLeaveTypeController = asyncHandler(async (req, res) => {
  const result = await updateLeaveType({
    companyId: req.user.companyId,

    leaveTypeId: req.params.leaveTypeId,

    userId: req.user.userId,

    data: req.body,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Leave type updated successfully"));
});

/* =========================================================
   LEAVE REQUESTS
========================================================= */

export const createLeaveRequestController = asyncHandler(async (req, res) => {
  const result = await createLeaveRequest({
    companyId: req.user.companyId,

    userId: req.user.userId,

    data: req.body,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, result, "Leave request submitted successfully"));
});

export const getMyLeaveRequestsController = asyncHandler(async (req, res) => {
  const result = await getMyLeaveRequests({
    companyId: req.user.companyId,

    userId: req.user.userId,

    startDate: req.query.startDate,

    endDate: req.query.endDate,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Leave requests fetched successfully"));
});

export const getLeaveBalancesController = asyncHandler(async (req, res) => {
  const result = await getLeaveBalances({
    companyId: req.user.companyId,

    userId: req.user.userId,

    year: Number(req.query.year) || new Date().getFullYear(),
  });

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Leave balances fetched successfully"));
});

/* =========================================================
   APPROVAL
========================================================= */

export const getPendingLeaveRequestsController = asyncHandler(
  async (req, res) => {
    const result = await getPendingLeaveRequests({
      companyId: req.user.companyId,
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          result,
          "Pending leave requests fetched successfully",
        ),
      );
  },
);

export const approveLeaveRequestController = asyncHandler(async (req, res) => {
  const result = await decideLeaveRequest({
    companyId: req.user.companyId,

    leaveRequestId: req.params.leaveRequestId,

    userId: req.user.userId,

    approve: true,

    decisionReason: req.body?.decisionReason,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Leave request approved successfully"));
});

export const rejectLeaveRequestController = asyncHandler(async (req, res) => {
  const result = await decideLeaveRequest({
    companyId: req.user.companyId,

    leaveRequestId: req.params.leaveRequestId,

    userId: req.user.userId,

    approve: false,

    decisionReason: req.body?.decisionReason,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Leave request rejected successfully"));
});

/* =========================================================
   CANCEL
========================================================= */

export const cancelLeaveRequestController = asyncHandler(async (req, res) => {
  const result = await cancelLeaveRequest({
    companyId: req.user.companyId,

    userId: req.user.userId,

    leaveRequestId: req.params.leaveRequestId,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Leave request cancelled successfully"));
});
