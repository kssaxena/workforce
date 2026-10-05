import asyncHandler from "../../../core/middleware/asyncHandler.js";
import ApiResponse from "../../../core/utils/ApiResponse.js";

import { getDashboardOverview } from "../services/dashboard.service.js";

export const getDashboardOverviewController = asyncHandler(async (req, res) => {
  const result = await getDashboardOverview({
    userId: req.user.userId,
    companyId: req.user.companyId,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, result, "Dashboard overview fetched successfully"),
    );
});
