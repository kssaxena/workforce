import asyncHandler from "../../../core/middleware/asyncHandler.js";
import ApiResponse from "../../../core/utils/ApiResponse.js";

export const rbacTest = asyncHandler(async (req, res) => {
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        userId: req.user.userId,
        companyId: req.user.companyId,
      },
      "RBAC authorization successful",
    ),
  );
});
