import asyncHandler from "../../../core/middleware/asyncHandler.js";
import ApiResponse from "../../../core/utils/ApiResponse.js";
import ApiError from "../../../core/errors/ApiError.js";

import {
  loginUser,
  getAuthenticatedUser,
  refreshUserSession,
  revokeSession,
} from "../services/auth.service.js";

const getRefreshCookieOptions = () => ({
  httpOnly: true,

  secure: process.env.NODE_ENV === "production",

  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",

  maxAge:
    Number(process.env.REFRESH_TOKEN_EXPIRY_DAYS || 30) * 24 * 60 * 60 * 1000,

  path: "/api/v1/auth",
});

const setRefreshCookie = (res, refreshToken) => {
  res.cookie("refreshToken", refreshToken, getRefreshCookieOptions());
};

const login = asyncHandler(async (req, res) => {
  const { email, password, companyId, portal } = req.body;

  const result = await loginUser({
    email,
    password,
    companyId,
    portal,

    ipAddress: req.ip,

    userAgent: req.get("user-agent"),
  });

  setRefreshCookie(res, result.refreshToken);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        accessToken: result.accessToken,

        sessionId: result.sessionId,

        user: result.user,

        company: result.company,

        employee: result.employee,

        roles: result.roles,

        roleCodes: result.roleCodes,

        permissions: result.permissions,
      },
      "Login successful",
    ),
  );
});

const me = asyncHandler(async (req, res) => {
  const result = await getAuthenticatedUser({
    userId: req.user.userId,
    companyId: req.user.companyId,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, result, "Authenticated user fetched successfully"),
    );
});

const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    throw new ApiError(401, "Refresh token is required");
  }

  const result = await refreshUserSession({
    refreshToken,
  });

  setRefreshCookie(res, result.refreshToken);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        accessToken: result.accessToken,

        sessionId: result.sessionId,

        user: result.user,

        company: result.company,

        employee: result.employee,

        roles: result.roles,

        roleCodes: result.roleCodes,

        permissions: result.permissions,
      },
      "Session refreshed successfully",
    ),
  );
});

const logout = asyncHandler(async (req, res) => {
  await revokeSession({
    userId: req.user.userId,
    sessionId: req.user.sessionId,
  });

  res.clearCookie("refreshToken", getRefreshCookieOptions());

  return res.status(200).json(new ApiResponse(200, null, "Logout successful"));
});

export { login, me, refresh, logout };
