import asyncHandler from "../../../core/middleware/asyncHandler.js";
import ApiResponse from "../../../core/utils/ApiResponse.js";

import {
  createUpgradeRequest,
  getCompanyUpgradeRequests,
} from "../services/upgradeRequest.service.js";

export const createUpgradeRequestController = asyncHandler(async (req, res) => {
  const request = await createUpgradeRequest({
    companyId: req.user.companyId,
    userId: req.user.userId,
    requestedPlan: req.body.requestedPlan,
    billingCycle: req.body.billingCycle,
    ipAddress: req.ip,
    userAgent: req.get("user-agent"),
  });

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        request,
        "Upgrade request created. Payment has not been initiated.",
      ),
    );
});

export const getCompanyUpgradeRequestsController = asyncHandler(
  async (req, res) => {
    const requests = await getCompanyUpgradeRequests({
      companyId: req.user.companyId,
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          requests,
          "Plan-change requests fetched successfully",
        ),
      );
  },
);
