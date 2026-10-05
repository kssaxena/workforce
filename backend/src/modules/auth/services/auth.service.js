import ApiError from "../../../core/errors/ApiError.js";

import User from "../models/user.model.js";
import Session from "../models/session.model.js";

import Company from "../../company/models/company.model.js";
import Employee from "../../employee/models/employee.model.js";

import UserRole from "../../rbac/models/userRole.model.js";
import RolePermission from "../../rbac/models/rolePermission.model.js";
import Permission from "../../rbac/models/permission.model.js";

import { comparePassword } from "./password.service.js";

import {
  generateAccessToken,
  generateRefreshToken,
  hashRefreshToken,
} from "./token.service.js";

const PORTAL_ROLES = {
  company: ["SUPER_ADMIN"],
  companyTeam: ["HR_ADMIN"],
  manager: ["MANAGER", "TEAM_LEADER"],
  employee: ["EMPLOYEE"],
};

const getUserCompanies = async (userId) => {
  const userRoles = await UserRole.find({
    userId,
    isActive: true,
  })
    .populate("roleId", "code name")
    .populate("companyId", "name status subscription");

  return userRoles;
};

const getAuthContext = async ({ userId, companyId }) => {
  const user = await User.findById(userId).select("-password");

  if (!user) {
    throw new ApiError(401, "User account no longer exists");
  }

  if (user.status !== "ACTIVE") {
    throw new ApiError(403, "This account is not active");
  }

  const roles = await UserRole.find({
    userId,
    companyId,
    isActive: true,
  })
    .populate("roleId", "name code description")
    .select("roleId");

  if (!roles.length) {
    throw new ApiError(403, "No active role is assigned for this company");
  }

  const roleCodes = roles.map((item) => item.roleId?.code).filter(Boolean);

  const roleIds = roles.map((item) => item.roleId?._id).filter(Boolean);

  const rolePermissions = await RolePermission.find({
    roleId: { $in: roleIds },
    granted: true,
  }).populate("permissionId", "module resource action code description");

  const permissions = [
    ...new Map(
      rolePermissions
        .filter((item) => item.permissionId?.code)
        .map((item) => [item.permissionId.code, item.permissionId]),
    ).values(),
  ];

  const company = await Company.findById(companyId).select("-__v");

  if (!company) {
    throw new ApiError(404, "Company not found");
  }

  if (company.status !== "ACTIVE") {
    throw new ApiError(403, "Company account is not active");
  }

  const employee = await Employee.findOne({
    userId,
    companyId,
    isActive: true,
  })
    .populate("departmentId", "name code")
    .populate("organizationUnitId", "name code")
    .populate("reportsTo", "employeeCode firstName lastName")
    .select("-__v");

  return {
    user: {
      _id: user._id,
      email: user.email,
      phone: user.phone,
      status: user.status,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      lastLoginAt: user.lastLoginAt,
    },

    company,

    employee,

    roles: roles.map((item) => ({
      _id: item.roleId._id,
      name: item.roleId.name,
      code: item.roleId.code,
      description: item.roleId.description,
    })),

    roleCodes,

    permissions,
  };
};

const resolveCompany = async ({ userId, companyId, portal }) => {
  const userRoles = await getUserCompanies(userId);

  if (!userRoles.length) {
    throw new ApiError(403, "This user has not been assigned to any company");
  }

  let selectedCompanyId = companyId;

  /*
   * If the user belongs to only one company,
   * automatically select it.
   */

  if (!selectedCompanyId) {
    const uniqueCompanies = [
      ...new Map(
        userRoles.map((item) => [
          item.companyId._id.toString(),
          item.companyId,
        ]),
      ).values(),
    ];

    if (uniqueCompanies.length > 1) {
      throw new ApiError(
        409,
        "This account belongs to multiple companies. companyId is required.",
      );
    }

    selectedCompanyId = uniqueCompanies[0]._id;
  }

  const companyRoles = userRoles.filter(
    (item) => item.companyId?._id?.toString() === selectedCompanyId.toString(),
  );

  if (!companyRoles.length) {
    throw new ApiError(
      403,
      "You are not associated with the requested company",
    );
  }

  if (portal) {
    const allowedRoles = PORTAL_ROLES[portal];

    if (!allowedRoles) {
      throw new ApiError(400, "Invalid login portal");
    }

    const hasPortalRole = companyRoles.some((item) =>
      allowedRoles.includes(item.roleId?.code),
    );

    if (!hasPortalRole) {
      throw new ApiError(
        403,
        "Your account is not authorized for this login portal",
      );
    }
  }

  return selectedCompanyId;
};

export const loginUser = async ({
  email,
  password,
  companyId,
  portal,
  ipAddress,
  userAgent,
}) => {
  const user = await User.findOne({
    email: email.toLowerCase(),
  }).select("+password");

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  if (user.status !== "ACTIVE") {
    throw new ApiError(403, "This account is not active");
  }

  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password");
  }

  const resolvedCompanyId = await resolveCompany({
    userId: user._id,
    companyId,
    portal,
  });

  const refreshToken = generateRefreshToken();

  const refreshTokenHash = hashRefreshToken(refreshToken);

  const refreshDays = Number(process.env.REFRESH_TOKEN_EXPIRY_DAYS || 30);

  const expiresAt = new Date();

  expiresAt.setDate(expiresAt.getDate() + refreshDays);

  const session = await Session.create({
    userId: user._id,
    companyId: resolvedCompanyId,
    refreshTokenHash,
    ipAddress,
    userAgent,
    expiresAt,
  });

  const accessToken = generateAccessToken({
    userId: user._id,
    companyId: resolvedCompanyId,
    sessionId: session._id,
  });

  user.lastLoginAt = new Date();

  await user.save();

  const authContext = await getAuthContext({
    userId: user._id,
    companyId: resolvedCompanyId,
  });

  return {
    accessToken,
    refreshToken,
    sessionId: session._id,
    ...authContext,
  };
};

export const getAuthenticatedUser = async ({ userId, companyId }) => {
  return getAuthContext({
    userId,
    companyId,
  });
};

export const refreshUserSession = async ({ refreshToken }) => {
  if (!refreshToken) {
    throw new ApiError(401, "Refresh token is required");
  }

  const refreshTokenHash = hashRefreshToken(refreshToken);

  const session = await Session.findOne({
    refreshTokenHash,
    revokedAt: null,
    expiresAt: {
      $gt: new Date(),
    },
  });

  if (!session) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const user = await User.findById(session.userId);

  if (!user || user.status !== "ACTIVE") {
    throw new ApiError(403, "User account is not active");
  }

  const company = await Company.findById(session.companyId);

  if (!company || company.status !== "ACTIVE") {
    throw new ApiError(403, "Company account is not active");
  }

  /*
   * Refresh token rotation.
   */

  const newRefreshToken = generateRefreshToken();

  session.refreshTokenHash = hashRefreshToken(newRefreshToken);

  await session.save();

  const accessToken = generateAccessToken({
    userId: user._id,
    companyId: session.companyId,
    sessionId: session._id,
  });

  const authContext = await getAuthContext({
    userId: user._id,
    companyId: session.companyId,
  });

  return {
    accessToken,
    refreshToken: newRefreshToken,
    sessionId: session._id,
    ...authContext,
  };
};

export const revokeSession = async ({ userId, sessionId }) => {
  if (!sessionId) {
    return;
  }

  await Session.findOneAndUpdate(
    {
      _id: sessionId,
      userId,
      revokedAt: null,
    },
    {
      $set: {
        revokedAt: new Date(),
      },
    },
  );
};

export { PORTAL_ROLES };
