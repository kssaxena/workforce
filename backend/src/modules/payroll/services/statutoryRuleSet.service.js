import ApiError from "../../../core/errors/ApiError.js";
import StatutoryRuleSet from "../models/statutoryRuleSet.model.js";

export const resolveStatutoryRuleSet = async ({
  ruleType,
  jurisdictionCode,
  effectiveDate,
}) => {
  const allowedTypes = ["EPF", "ESI", "PROFESSIONAL_TAX", "TDS"];

  if (!allowedTypes.includes(ruleType)) {
    throw new ApiError(400, "Unsupported statutory rule type");
  }

  if (typeof jurisdictionCode !== "string" || !jurisdictionCode.trim()) {
    throw new ApiError(422, "A statutory jurisdiction code is required");
  }

  const date = new Date(effectiveDate);

  if (Number.isNaN(date.getTime())) {
    throw new ApiError(
      422,
      "A valid statutory rule effective date is required",
    );
  }

  const jurisdiction = jurisdictionCode.trim().toUpperCase();

  const matchingRules = await StatutoryRuleSet.find({
    ruleType,
    jurisdictionCode: jurisdiction,
    status: "VERIFIED",
    effectiveFrom: { $lte: date },
    $or: [
      { effectiveTo: null },
      { effectiveTo: { $exists: false } },
      { effectiveTo: { $gte: date } },
    ],
  })
    .sort({ effectiveFrom: -1 })
    .lean();

  if (matchingRules.length === 0) {
    throw new ApiError(
      422,
      `No verified ${ruleType} ruleset exists for ${jurisdiction} on ${date.toISOString().slice(0, 10)}`,
    );
  }

  if (matchingRules.length > 1) {
    throw new ApiError(
      409,
      `Overlapping verified ${ruleType} rulesets exist for ${jurisdiction}; resolve the overlap before payroll`,
    );
  }

  const ruleset = matchingRules[0];

  if (
    !ruleset.verifiedBy ||
    !ruleset.verifiedAt ||
    !Array.isArray(ruleset.sources) ||
    ruleset.sources.length === 0
  ) {
    throw new ApiError(
      422,
      `The verified ${ruleType} ruleset is missing verification evidence`,
    );
  }

  return ruleset;
};
