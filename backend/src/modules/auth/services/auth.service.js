import ApiError from "../../../core/errors/ApiError.js";

import User from "../models/user.model.js";
import Session from "../models/session.model.js";

import CompanyRepresentative from "../../representative/models/companyRepresentative.model.js";

import { comparePassword } from "./password.service.js";

import {
  generateAccessToken,
  generateRefreshToken,
  hashRefreshToken,
} from "./token.service.js";

const loginUser = async ({ email, password, ipAddress, userAgent }) => {
  /*
   * ==========================================
   * 1. FIND USER
   * ==========================================
   */

  const user = await User.findOne({
    email: email.toLowerCase(),
  }).select("+password");

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  /*
   * ==========================================
   * 2. CHECK USER STATUS
   * ==========================================
   */

  if (user.status !== "ACTIVE") {
    throw new ApiError(403, "This account is not active");
  }

  /*
   * ==========================================
   * 3. VERIFY PASSWORD
   * ==========================================
   */

  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password");
  }

  /*
   * ==========================================
   * 4. FIND COMPANY REPRESENTATIVE
   * ==========================================
   */

  const representative = await CompanyRepresentative.findOne({
    userId: user._id,
    status: "ACTIVE",
  });

  if (!representative) {
    throw new ApiError(403, "No active company association found");
  }

  /*
   * ==========================================
   * 5. GENERATE TOKENS
   * ==========================================
   */

  const accessToken = generateAccessToken({
    userId: user._id,
    companyId: representative.companyId,
  });

  const refreshToken = generateRefreshToken();

  /*
   * ==========================================
   * 6. HASH REFRESH TOKEN
   * ==========================================
   */

  const refreshTokenHash = hashRefreshToken(refreshToken);

  /*
   * ==========================================
   * 7. CREATE SESSION
   * ==========================================
   */

  const refreshDays = Number(process.env.REFRESH_TOKEN_EXPIRY_DAYS || 30);

  const expiresAt = new Date();

  expiresAt.setDate(expiresAt.getDate() + refreshDays);

  const session = await Session.create({
    userId: user._id,

    companyId: representative.companyId,

    refreshTokenHash,

    ipAddress,
    userAgent,

    expiresAt,
  });

  /*
   * ==========================================
   * 8. UPDATE LOGIN TIME
   * ==========================================
   */

  user.lastLoginAt = new Date();

  await user.save();

  /*
   * ==========================================
   * 9. RETURN AUTH DATA
   * ==========================================
   */

  return {
    accessToken,
    refreshToken,

    sessionId: session._id,

    user: {
      _id: user._id,
      email: user.email,
      phone: user.phone,
      status: user.status,
    },

    companyId: representative.companyId,
  };
};

export default loginUser;
