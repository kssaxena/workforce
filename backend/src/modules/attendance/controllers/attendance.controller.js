import asyncHandler from "../../../core/middleware/asyncHandler.js";
import ApiResponse from "../../../core/utils/ApiResponse.js";

import { checkIn } from "../services/attendance.service.js";

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
