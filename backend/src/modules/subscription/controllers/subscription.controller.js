import asyncHandler from "../../../core/middleware/asyncHandler.js";
import ApiResponse from "../../../core/utils/ApiResponse.js";

import {
  getAvailablePlans,
  getCompanySubscriptionSummary,
} from "../services/subscription.service.js";

export const getAvailablePlansController = asyncHandler(async (_req, res) => {
  const plans = getAvailablePlans();

  return res
    .status(200)
    .json(new ApiResponse(200, plans, "Plans fetched successfully"));
});

export const getCurrentSubscriptionController = asyncHandler(
  async (req, res) => {
    const summary = await getCompanySubscriptionSummary({
      companyId: req.user.companyId,
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          summary,
          "Subscription details fetched successfully",
        ),
      );
  },
);
