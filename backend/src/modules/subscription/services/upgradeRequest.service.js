import ApiError from "../../../core/errors/ApiError.js";

import Company from "../../company/models/company.model.js";
import Employee from "../../employee/models/employee.model.js";
import { createAuditLog } from "../../audit/services/audit.service.js";

import { getPlanDefinition, resolvePlanCode } from "../config/planCatalog.js";
import SubscriptionChangeRequest from "../models/subscriptionChangeRequest.model.js";

const PLAN_RANK = {
  FREE: 0,
  BEGINNER: 1,
  INTERMEDIATE: 2,
  PRO: 3,
};

export const createUpgradeRequest = async ({
  companyId,
  userId,
  requestedPlan,
  billingCycle,
  ipAddress,
  userAgent,
}) => {
  const company = await Company.findById(companyId).select(
    "name status subscription",
  );

  if (!company) {
    throw new ApiError(404, "Company not found");
  }

  if (company.status !== "ACTIVE") {
    throw new ApiError(403, "Only active companies can request a plan upgrade");
  }

  const subscription = company.subscription;

  if (
    !subscription ||
    !["TRIAL", "ACTIVE", "PAST_DUE", "EXPIRED"].includes(subscription.status)
  ) {
    throw new ApiError(
      403,
      "This subscription cannot be upgraded. Contact support for assistance.",
    );
  }

  const currentPlanCode = resolvePlanCode(subscription.plan);
  const currentPlan = getPlanDefinition(currentPlanCode);
  const targetPlan = getPlanDefinition(requestedPlan);

  if (!currentPlan || !targetPlan) {
    throw new ApiError(400, "Current or requested plan is not configured");
  }

  if (PLAN_RANK[targetPlan.code] <= PLAN_RANK[currentPlan.code]) {
    throw new ApiError(
      400,
      "Select a plan above your current plan to request an upgrade",
    );
  }

  const employeeCount = await Employee.countDocuments({
    companyId,
    isActive: true,
    employmentStatus: {
      $nin: ["RESIGNED", "TERMINATED"],
    },
  });

  if (employeeCount > targetPlan.employeeLimit) {
    throw new ApiError(
      409,
      `Your company has ${employeeCount} active employees, which exceeds the ${targetPlan.name} plan limit of ${targetPlan.employeeLimit}.`,
    );
  }

  const pricePerEmployee =
    billingCycle === "ANNUAL"
      ? targetPlan.pricing.annualPerEmployeeMonthlyEquivalent
      : targetPlan.pricing.monthlyPerEmployee;

  const estimatedTotal =
    billingCycle === "ANNUAL"
      ? pricePerEmployee * 12 * employeeCount
      : pricePerEmployee * employeeCount;

  let request;

  try {
    request = await SubscriptionChangeRequest.create({
      companyId,
      requestedBy: userId,
      currentPlan: currentPlan.code,
      requestedPlan: targetPlan.code,
      billingCycle,
      currency: "INR",
      employeeCountAtRequest: employeeCount,
      employeeLimit: targetPlan.employeeLimit,
      pricePerEmployee,
      estimatedTotal,
      status: "PENDING_PAYMENT",
    });
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(
        409,
        "Your company already has an unresolved plan-change request",
      );
    }

    throw error;
  }

  await createAuditLog({
    companyId,
    actorId: userId,
    action: "PLAN_CHANGE_REQUESTED",
    module: "subscription",
    entityType: "SubscriptionChangeRequest",
    entityId: request._id,
    description: `Requested an upgrade from ${currentPlan.name} to ${targetPlan.name}`,
    before: {
      plan: currentPlan.code,
    },
    after: {
      requestedPlan: targetPlan.code,
      billingCycle,
      status: request.status,
    },
    metadata: {
      employeeCount,
      employeeLimit: targetPlan.employeeLimit,
      currency: "INR",
      pricePerEmployee,
      estimatedTotal,
    },
    ipAddress,
    userAgent,
  });

  return request;
};

export const getCompanyUpgradeRequests = async ({ companyId }) => {
  return SubscriptionChangeRequest.find({ companyId })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();
};
