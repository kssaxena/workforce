import ApiError from "../../../core/errors/ApiError.js";
import {
  PAYROLL_CALCULATION_VERSION,
  roundRatio,
} from "./payrollCalculation.service.js";

export const PAYROLL_CALCULATION_VERSION = "payroll-v1";

export const assertPaise = (value, field = "amountPaise") => {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new ApiError(
      400,
      `${field} must be a non-negative integer number of paise`,
    );
  }

  return value;
};

export const roundRatio = (amount, numerator, denominator) => {
  assertPaise(amount, "amount");
  if (
    !Number.isSafeInteger(numerator) ||
    !Number.isSafeInteger(denominator) ||
    numerator < 0 ||
    denominator <= 0
  ) {
    throw new ApiError(400, "Invalid proration ratio");
  }

  // Integer arithmetic, rounded to the nearest paise.
  const product = BigInt(amount) * BigInt(numerator);
  const divisor = BigInt(denominator);
  const rounded = (product + divisor / 2n) / divisor;

  if (rounded > BigInt(Number.MAX_SAFE_INTEGER)) {
    throw new ApiError(400, "Calculated amount exceeds safe integer range");
  }

  return Number(rounded);
};

export const getCalendarPeriod = (year, month) => {
  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    month < 1 ||
    month > 12 ||
    year < 2000 ||
    year > 2200
  ) {
    throw new ApiError(400, "Invalid payroll year or month");
  }

  // UTC boundaries prevent server-local timezone shifts.
  const periodStart = new Date(Date.UTC(year, month - 1, 1));
  const periodEnd = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

  return {
    periodStart,
    periodEnd,
    calendarDays: new Date(Date.UTC(year, month, 0)).getUTCDate(),
  };
};

const utcDay = (date) => {
  const value = new Date(date);
  if (Number.isNaN(value.getTime())) {
    throw new ApiError(400, "Invalid date in payroll input");
  }

  return Date.UTC(
    value.getUTCFullYear(),
    value.getUTCMonth(),
    value.getUTCDate(),
  );
};

export const getEligibleCalendarDays = ({
  periodStart,
  periodEnd,
  joiningDate,
  exitDate = null,
}) => {
  const start = utcDay(periodStart);
  const end = utcDay(periodEnd);
  const joined = utcDay(joiningDate);
  const exited = exitDate ? utcDay(exitDate) : end;

  const effectiveStart = Math.max(start, joined);
  const effectiveEnd = Math.min(end, exited);

  if (effectiveEnd < effectiveStart) return 0;

  return Math.floor((effectiveEnd - effectiveStart) / 86400000) + 1;
};

export const prorateMonthlyAmount = ({
  monthlyAmountPaise,
  eligibleCalendarDays,
  periodCalendarDays,
}) => {
  assertPaise(monthlyAmountPaise, "monthlyAmountPaise");

  if (
    !Number.isInteger(eligibleCalendarDays) ||
    !Number.isInteger(periodCalendarDays) ||
    periodCalendarDays < 1 ||
    eligibleCalendarDays < 0 ||
    eligibleCalendarDays > periodCalendarDays
  ) {
    throw new ApiError(400, "Invalid eligible-day proration inputs");
  }

  return roundRatio(
    monthlyAmountPaise,
    eligibleCalendarDays,
    periodCalendarDays,
  );
};

export const sumPaise = (amounts) => {
  const total = amounts.reduce((sum, amount) => {
    assertPaise(amount);
    const next = BigInt(sum) + BigInt(amount);

    if (next > BigInt(Number.MAX_SAFE_INTEGER)) {
      throw new ApiError(400, "Payroll total exceeds safe integer range");
    }

    return Number(next);
  }, 0);

  return total;
};

export const validateFinalization = ({
  complianceProfile,
  statutoryResults,
  employees,
}) => {
  const issues = [];

  if (!complianceProfile || complianceProfile.status !== "VERIFIED") {
    issues.push({
      code: "COMPLIANCE_PROFILE_UNVERIFIED",
      message: "Company payroll compliance profile is not verified.",
    });
  }

  if (
    !complianceProfile?.complianceRulesetVersion ||
    !complianceProfile?.incomeTax?.rulesetVersion
  ) {
    issues.push({
      code: "STATUTORY_RULESET_MISSING",
      message: "Verified statutory ruleset versions are required.",
    });
  }

  if (!Array.isArray(employees) || employees.length === 0) {
    issues.push({
      code: "NO_EMPLOYEES",
      message: "There are no eligible employee payroll records.",
    });
  }

  for (const employee of employees || []) {
    if (employee.validationIssues?.some((issue) => issue.blocking)) {
      issues.push({
        code: "EMPLOYEE_PAYROLL_BLOCKED",
        message: `Payroll has unresolved issues for ${employee.employeeCode}.`,
      });
    }
  }

  if (!Array.isArray(statutoryResults)) {
    issues.push({
      code: "STATUTORY_CALCULATION_MISSING",
      message: "Statutory calculation results are missing.",
    });
  } else {
    const required = ["PF", "ESI", "PROFESSIONAL_TAX", "TDS"];

    for (const code of required) {
      const result = statutoryResults.find((item) => item.code === code);

      if (!result || result.verified !== true || !result.rulesetVersion) {
        issues.push({
          code: `STATUTORY_${code}_UNVERIFIED`,
          message: `${code} calculation is missing or unverified.`,
        });
      }
    }
  }

  return {
    canFinalize: issues.length === 0,
    issues,
  };
};
