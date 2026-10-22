import ApiError from "../../../core/errors/ApiError.js";
import asyncHandler from "../../../core/middleware/asyncHandler.js";
import Company from "../../company/models/company.model.js";
import { getPlanDefinition } from "../config/planCatalog.js";

const requireFeature = (featureKey) =>
  asyncHandler(async (req, res, next) => {
    if (!req.user?.companyId) {
      throw new ApiError(401, "Authentication required");
    }

    const company = await Company.findById(req.user.companyId)
      .select("status subscription")
      .lean();

    if (!company) {
      throw new ApiError(404, "Company not found");
    }

    if (company.status !== "ACTIVE") {
      throw new ApiError(
        403,
        "Your company is not active. Please contact your administrator.",
      );
    }

    const subscription = company.subscription;

    if (!subscription || !["ACTIVE", "TRIAL"].includes(subscription.status)) {
      throw new ApiError(
        403,
        "Your subscription is not active. Review your subscription to continue.",
      );
    }

    if (subscription.status === "TRIAL") {
      const trialEnd = subscription.trialEndsAt
        ? new Date(subscription.trialEndsAt).getTime()
        : 0;

      if (!trialEnd || trialEnd <= Date.now()) {
        throw new ApiError(
          403,
          "Your trial has expired. Review your subscription to continue.",
        );
      }
    }

    const plan = getPlanDefinition(subscription.plan);

    if (!plan) {
      throw new ApiError(
        403,
        "Your subscription plan is not recognized. Please contact support.",
      );
    }

    if (!Object.prototype.hasOwnProperty.call(plan.features, featureKey)) {
      throw new ApiError(
        500,
        `Feature "${featureKey}" is not configured in the plan catalogue.`,
      );
    }

    if (plan.features[featureKey] !== true) {
      throw new ApiError(
        403,
        `${featureKey} is not included in your ${plan.name} plan. Upgrade your plan to access this feature.`,
      );
    }

    req.subscription = {
      planCode: plan.code,
      planName: plan.name,
      featureKey,
    };

    next();
  });

export default requireFeature;
