import ApiError from "../../../core/errors/ApiError.js";

import EmployeePayrollProfile from "../models/employeePayrollProfile.model.js";
import PayrollComplianceProfile from "../models/payrollComplianceProfile.model.js";

import { resolveStatutoryRuleSet } from "./statutoryRuleSet.service.js";
import { assertVerifiedRuleSet } from "./statutoryCalculators.service.js";

const REQUIRED_RULE_TYPES = ["EPF", "ESI", "PROFESSIONAL_TAX", "TDS"];

/**
 * Validates employee and company payroll compliance before
 * statutory calculations are permitted.
 *
 * This is a validation/preflight layer, not the final calculator.
 * It intentionally does not invent rates or return fabricated amounts.
 */
export const calculateEmployeeStatutoryPayroll = async ({
  companyId,
  employeeId,
  effectiveDate,
}) => {
  if (!companyId || !employeeId) {
    throw new ApiError(
      400,
      "Company ID and employee ID are required for statutory payroll",
    );
  }

  const date = new Date(effectiveDate);

  if (!effectiveDate || Number.isNaN(date.getTime())) {
    throw new ApiError(
      422,
      "A valid statutory payroll effective date is required",
    );
  }

  const [complianceProfile, employeeProfile] = await Promise.all([
    PayrollComplianceProfile.findOne({ companyId }).lean(),
    EmployeePayrollProfile.findOne({
      companyId,
      employeeId,
    }).lean(),
  ]);

  if (!complianceProfile) {
    throw new ApiError(422, "Company payroll compliance profile is missing");
  }

  if (complianceProfile.status !== "VERIFIED") {
    throw new ApiError(
      422,
      "Company payroll compliance profile must be verified",
    );
  }

  if (!complianceProfile.stateCode) {
    throw new ApiError(
      422,
      "Company state code is required for statutory payroll",
    );
  }

  if (!employeeProfile) {
    throw new ApiError(422, "Employee payroll profile is missing");
  }

  if (employeeProfile.profileStatus !== "VERIFIED") {
    throw new ApiError(422, "Employee payroll profile must be verified");
  }

  const ruleSetVersions = {};
  const resolvedRuleSets = {};

  for (const ruleType of REQUIRED_RULE_TYPES) {
    const companyRule =
      complianceProfile[
        ruleType === "EPF"
          ? "pf"
          : ruleType === "ESI"
            ? "esi"
            : ruleType === "PROFESSIONAL_TAX"
              ? "professionalTax"
              : "incomeTax"
      ];

    // Respect company-level applicability settings.
    if (ruleType !== "TDS" && companyRule?.applicable === false) {
      continue;
    }

    if (ruleType === "TDS" && companyRule?.enabled === false) {
      continue;
    }

    if (
      ruleType !== "TDS" &&
      (companyRule?.applicable !== true ||
        !companyRule?.verifiedAt ||
        !companyRule?.verifiedBy)
    ) {
      throw new ApiError(
        422,
        `Company ${ruleType} applicability must be verified`,
      );
    }

    const jurisdictionCode =
      ruleType === "TDS" || ruleType === "EPF" || ruleType === "ESI"
        ? "IN"
        : `IN-${employeeProfile.stateCode}`;

    const ruleset = await resolveStatutoryRuleSet({
      ruleType,
      jurisdictionCode,
      effectiveDate: date,
    });

    const parameters = assertVerifiedRuleSet(ruleset, ruleType);

    // Do not accept an empty parameter object as a usable ruleset.
    if (Object.keys(parameters).length === 0) {
      throw new ApiError(
        422,
        `Verified ${ruleType} ruleset has no calculation parameters`,
      );
    }

    resolvedRuleSets[ruleType] = {
      ruleset,
      parameters,
    };

    ruleSetVersions[ruleType] = ruleset.version;
  }

  /*
   * Calculation is deliberately not performed here yet.
   *
   * Before enabling payroll finalization, each rule type needs a
   * validated parameter schema and its corresponding calculator.
   * TDS additionally needs verified annual projection inputs and
   * finalized year-to-date ledger entries.
   */
  throw new ApiError(
    422,
    "Statutory preflight passed, but rule-specific calculation is not yet connected. Payroll cannot be finalized.",
  );
};
