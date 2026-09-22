import ApiError from "../../../core/errors/ApiError.js";
import asyncHandler from "../../../core/middleware/asyncHandler.js";
import { hasPermission } from "../services/permission.service.js";

const authorize = (permissionCode) =>
  asyncHandler(async (req, res, next) => {
    if (!req.user) {
      throw new ApiError(401, "Authentication required");
    }

    const allowed = await hasPermission({
      userId: req.user.userId,
      companyId: req.user.companyId,
      permissionCode,
    });

    if (!allowed) {
      throw new ApiError(
        403,
        "You do not have permission to perform this action",
      );
    }

    next();
  });

export default authorize;
