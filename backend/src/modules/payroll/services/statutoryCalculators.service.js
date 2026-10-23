import ApiError from "../../../core/errors/ApiError.js";

/**
 * Statutory calculation utilities.
 *
 * All monetary values are integer paise.
 * Rates are expressed in basis points:
 * 100 basis points = 1%.
 *
 * IMPORTANT:
 * Pass rates, wage ceilings, and rounding rules from a verified
 * StatutoryRuleSet. Never put statutory rates in this file.
 */

export const assertPaise = (value, fieldName) => {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new ApiError(
      422,
      `${fieldName} must be a non-negative safe integer in paise`,
    );
  }

  return value;
};

export const assertBasisPoints = (value, fieldName) => {
  if (!Number.isSafeInteger(value) || value < 0 || value > 10000) {
    throw new ApiError(
      422,
      `${fieldName} must be an integer between 0 and 10000 basis points`,
    );
  }

  return value;
};

/**
 * Calculates a percentage of a monetary amount.
 *
 * roundingUnitPaise:
 * - 1 means round to the nearest paise.
 * - 100 means round to the nearest rupee.
 *
 * The rounding unit must come from the applicable verified rule set.
 */
export const calculateRatePaise = ({
  amountPaise,
  rateBasisPoints,
  roundingUnitPaise,
  fieldName = "Statutory contribution",
}) => {
  assertPaise(amountPaise, "Calculation amount");
  assertBasisPoints(rateBasisPoints, "Rate");
  assertPaise(roundingUnitPaise, "Rounding unit");

  if (roundingUnitPaise < 1) {
    throw new ApiError(
      422,
      `${fieldName}: rounding unit must be at least one paise`,
    );
  }

  const numerator = BigInt(amountPaise) * BigInt(rateBasisPoints);
  const denominator = 10000n * BigInt(roundingUnitPaise);

  // Round to the nearest configured unit, with half rounded upward.
  const roundedUnits = (numerator + denominator / 2n) / denominator;

  const result = roundedUnits * BigInt(roundingUnitPaise);

  if (result > BigInt(Number.MAX_SAFE_INTEGER)) {
    throw new ApiError(422, `${fieldName} exceeds the safe integer range`);
  }

  return Number(result);
};

/**
 * Calculates a contribution against a wage amount.
 *
 * The caller must supply the applicable rate and any wage ceiling
 * from a verified ruleset. A null ceiling means no ceiling is applied
 * by this utility; the caller must establish that this is correct
 * for the applicable rule before passing null.
 */
export const calculateContributionPaise = ({
  wagePaise,
  rateBasisPoints,
  wageCeilingPaise,
  roundingUnitPaise,
  fieldName = "Statutory contribution",
}) => {
  assertPaise(wagePaise, "Contribution wage");
  assertBasisPoints(rateBasisPoints, "Contribution rate");

  if (wageCeilingPaise !== null && wageCeilingPaise !== undefined) {
    assertPaise(wageCeilingPaise, "Wage ceiling");
  }

  assertPaise(roundingUnitPaise, "Rounding unit");

  if (roundingUnitPaise < 1) {
    throw new ApiError(
      422,
      `${fieldName}: rounding unit must be at least one paise`,
    );
  }

  const applicableWagePaise =
    wageCeilingPaise === null || wageCeilingPaise === undefined
      ? wagePaise
      : Math.min(wagePaise, wageCeilingPaise);

  const contributionPaise = calculateRatePaise({
    amountPaise: applicableWagePaise,
    rateBasisPoints,
    roundingUnitPaise,
    fieldName,
  });

  return {
    wagePaise,
    applicableWagePaise,
    rateBasisPoints,
    roundingUnitPaise,
    contributionPaise,
  };
};

/**
 * Validates that a ruleset has been resolved and verified before
 * its parameters are used for calculations.
 *
 * This checks verification evidence only. Rule-specific parameter
 * validation will be added alongside each statutory calculator.
 */
export const assertVerifiedRuleSet = (ruleset, expectedRuleType) => {
  if (!ruleset || typeof ruleset !== "object") {
    throw new ApiError(422, "A verified statutory ruleset is required");
  }

  if (ruleset.ruleType !== expectedRuleType) {
    throw new ApiError(422, `Expected a ${expectedRuleType} ruleset`);
  }

  if (ruleset.status !== "VERIFIED") {
    throw new ApiError(422, `${expectedRuleType} ruleset is not verified`);
  }

  if (
    !ruleset.verifiedBy ||
    !ruleset.verifiedAt ||
    !Array.isArray(ruleset.sources) ||
    ruleset.sources.length === 0
  ) {
    throw new ApiError(
      422,
      `${expectedRuleType} ruleset is missing verification evidence`,
    );
  }

  if (
    !ruleset.parameters ||
    typeof ruleset.parameters !== "object" ||
    Array.isArray(ruleset.parameters)
  ) {
    throw new ApiError(
      422,
      `${expectedRuleType} ruleset has invalid parameters`,
    );
  }

  return ruleset.parameters;
};
