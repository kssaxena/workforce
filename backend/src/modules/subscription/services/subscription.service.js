import ApiError from "../../../core/errors/ApiError.js";
import Company from "../../company/models/company.model.js";
import Employee from "../../employee/models/employee.model.js";
import { getPlanDefinition } from "../config/planCatalog.js";

import { PLAN_CATALOG } from "../config/planCatalog.js";

// Add this import at the top of the file:
// import { resolvePlanCode } from "../config/planCatalog.js";

export const getAvailablePlans = () =>
  Object.values(PLAN_CATALOG).map((plan) => ({
    ...plan,
    currency: "INR",
  }));

export const getCompanySubscriptionSummary = async ({ companyId }) => {
  const company = await Company.findById(companyId).select(
    "status subscription",
  );

  if (!company) {
    throw new ApiError(404, "Company not found");
  }

  const subscription = company.subscription;
  const plan = getPlanDefinition(subscription?.plan);

  if (!plan) {
    throw new ApiError(500, "Company subscription plan is not configured");
  }

  const activeEmployeeCount = await Employee.countDocuments({
    companyId,
    isActive: true,
    employmentStatus: {
      $nin: ["RESIGNED", "TERMINATED"],
    },
  });

  return {
    companyStatus: company.status,
    plan: {
      code: plan.code,
      name: plan.name,
      employeeLimit: plan.employeeLimit,
      pricing: plan.pricing,
      features: plan.features,
    },
    subscription: {
      status: subscription.status,
      trialEndsAt: subscription.trialEndsAt || null,
      startsAt: subscription.startsAt || null,
      expiresAt: subscription.expiresAt || null,
    },
    usage: {
      activeEmployees: activeEmployeeCount,
      employeeLimit: plan.employeeLimit,
      remainingSeats: Math.max(0, plan.employeeLimit - activeEmployeeCount),
      limitReached: activeEmployeeCount >= plan.employeeLimit,
    },
  };
};

export const assertEmployeeSeatAvailable = async ({ companyId, session }) => {
  // Serialize employee creation for this company within the transaction.
  // Concurrent transactions attempting this write will conflict and retry.
  const lockResult = await Company.updateOne(
    { _id: companyId },
    {
      $inc: {
        "subscription.usageRevision": 1,
      },
    },
    { session },
  );

  if (lockResult.matchedCount === 0) {
    throw new ApiError(404, "Company not found");
  }

  const company = await Company.findById(companyId).session(session);

  if (!company || company.status !== "ACTIVE") {
    throw new ApiError(
      403,
      "Your company is not active and cannot add employees",
    );
  }

  const subscription = company.subscription;

  if (!subscription || !["ACTIVE", "TRIAL"].includes(subscription.status)) {
    throw new ApiError(
      403,
      "Your subscription does not allow adding employees. Please review your plan.",
    );
  }

  if (subscription.status === "TRIAL") {
    if (
      !subscription.trialEndsAt ||
      new Date(subscription.trialEndsAt).getTime() <= Date.now()
    ) {
      throw new ApiError(
        403,
        "Your free trial has expired. Review your subscription to add employees.",
      );
    }
  }

  const plan = getPlanDefinition(subscription.plan);

  if (!plan) {
    throw new ApiError(
      403,
      "Your company has an unrecognized subscription plan. Please contact support.",
    );
  }

  const activeEmployeeCount = await Employee.countDocuments({
    companyId,
    isActive: true,
    employmentStatus: {
      $nin: ["RESIGNED", "TERMINATED"],
    },
  }).session(session);

  if (activeEmployeeCount >= plan.employeeLimit) {
    throw new ApiError(
      403,
      `${plan.name} plan allows up to ${plan.employeeLimit} active employees. Upgrade your plan to add more employees.`,
    );
  }

  return {
    planCode: plan.code,
    planName: plan.name,
    employeeLimit: plan.employeeLimit,
    activeEmployeeCount,
    remainingSeats: Math.max(0, plan.employeeLimit - activeEmployeeCount),
  };
};
