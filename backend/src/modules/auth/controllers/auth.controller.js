import asyncHandler from "../../../core/middleware/asyncHandler.js";
import ApiResponse from "../../../core/utils/ApiResponse.js";

import loginUser from "../services/auth.service.js";

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const result = await loginUser({
    email,
    password,

    ipAddress: req.ip,

    userAgent: req.get("user-agent"),
  });

  /*
   * Store refresh token in HTTP-only cookie.
   */

  res.cookie("refreshToken", result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",

    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",

    maxAge:
      Number(process.env.REFRESH_TOKEN_EXPIRY_DAYS || 30) * 24 * 60 * 60 * 1000,
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        accessToken: result.accessToken,

        sessionId: result.sessionId,

        user: result.user,

        companyId: result.companyId,
      },
      "Login successful",
    ),
  );
});

export default login;
