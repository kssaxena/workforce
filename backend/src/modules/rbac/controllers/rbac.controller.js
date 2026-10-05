import asyncHandler from "../../../core/middleware/asyncHandler.js";
import ApiResponse from "../../../core/utils/ApiResponse.js";
import { getCompanyRoles } from "../services/role.service.js";

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

export const getRoles = asyncHandler(async (req, res) => {
  const roles = await getCompanyRoles({
    companyId: req.user.companyId,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, roles, "Roles fetched successfully"));
});
