import mongoose from "mongoose";
import { DateTime } from "luxon";

import ApiError from "../../../core/errors/ApiError.js";
import PayrollTaxLedger from "../models/payrollTaxLedger.model.js";

const assertPaise = (value, fieldName) => {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new ApiError(
      422,
      `${fieldName} must be a non-negative safe integer in paise`,
    );
  }

  return value;
};

const addPaise = (left, right) => {
  const result = BigInt(left) + BigInt(right);

  if (result < 0n || result > BigInt(Number.MAX_SAFE_INTEGER)) {
    throw new ApiError(422, "TDS projection exceeds the safe integer range");
  }

  return Number(result);
};

const subtractPaise = (left, right) => {
  const result = BigInt(left) - BigInt(right);

  if (result < 0n) {
    throw new ApiError(
      422,
      "TDS projection history is inconsistent; review tax ledger entries",
    );
  }

  return Number(result);
};

/**
 * India financial-year projection:
 * April through March.
 *
 * This function reads finalized tax ledger entries only.
 * It never writes ledger entries.
 *
 * All money values are integer paise.
 */
export const buildTdsProjectionInputs = async ({
  companyId,
  employeeId,
  taxYear,
  periodStart,
  periodEnd,
  currentPeriodTaxableSalaryPaise,
  projectedMonthlyTaxableSalaryPaise,
  approvedAnnualDeductionsPaise,
}) => {
  if (
    !mongoose.isValidObjectId(companyId) ||
    !mongoose.isValidObjectId(employeeId)
  ) {
    throw new ApiError(400, "Invalid company or employee ID");
  }

  if (typeof taxYear !== "string" || !taxYear.trim()) {
    throw new ApiError(422, "A verified employee income-tax year is required");
  }

  const start = DateTime.fromJSDate(new Date(periodStart), {
    zone: "utc",
  });

  const end = DateTime.fromJSDate(new Date(periodEnd), {
    zone: "utc",
  });

  if (
    !start.isValid ||
    !end.isValid ||
    start > end ||
    start.month !== end.month ||
    start.year !== end.year
  ) {
    throw new ApiError(422, "Invalid payroll projection period");
  }

  const currentTaxable = assertPaise(
    currentPeriodTaxableSalaryPaise,
    "Current-period taxable salary",
  );

  const projectedMonthlyTaxable = assertPaise(
    projectedMonthlyTaxableSalaryPaise,
    "Projected monthly taxable salary",
  );

  const approvedDeductions = assertPaise(
    approvedAnnualDeductionsPaise,
    "Approved annual deductions",
  );

  // Financial year starts on 1 April and ends on 31 March.
  const financialYearStartYear = start.month >= 4 ? start.year : start.year - 1;

  const financialYearStart = DateTime.fromObject(
    {
      year: financialYearStartYear,
      month: 4,
      day: 1,
    },
    { zone: "utc" },
  ).startOf("day");

  const financialYearEnd = financialYearStart
    .plus({ years: 1 })
    .minus({ milliseconds: 1 });

  if (start < financialYearStart || end > financialYearEnd) {
    throw new ApiError(
      422,
      "Payroll period falls outside the calculated financial year",
    );
  }

  // April = 12 months remaining; March = 1.
  const monthsRemainingIncludingCurrent = 12 - ((start.month - 4 + 12) % 12);

  /*
   * Only finalized ledger history before this payroll period is used.
   * The current payroll period is projected separately, so a draft
   * cannot count itself as already-paid salary or TDS.
   */
  const ledgerEntries = await PayrollTaxLedger.find({
    companyId,
    employeeId,
    taxYear,
    paymentDate: {
      $gte: financialYearStart.toJSDate(),
      $lt: start.toJSDate(),
    },
  })
    .select("entryType taxableSalaryPaise tdsDeductedPaise adjustmentDirection")
    .lean();

  let ytdTaxableSalaryPaise = 0;
  let taxAlreadyDeductedPaise = 0;

  for (const entry of ledgerEntries) {
    const taxable = assertPaise(
      entry.taxableSalaryPaise,
      "Ledger taxable salary",
    );

    const tds = assertPaise(entry.tdsDeductedPaise, "Ledger TDS");

    let direction;

    if (entry.entryType === "WITHHOLDING") {
      direction = 1;
    } else if (entry.entryType === "REVERSAL") {
      direction = -1;
    } else if (entry.entryType === "ADJUSTMENT") {
      if (
        entry.adjustmentDirection !== "ADD" &&
        entry.adjustmentDirection !== "REDUCE"
      ) {
        throw new ApiError(422, "Tax ledger adjustment has no valid direction");
      }

      direction = entry.adjustmentDirection === "ADD" ? 1 : -1;
    } else {
      throw new ApiError(
        422,
        "Unknown tax ledger entry type; review the ledger",
      );
    }

    if (direction === 1) {
      ytdTaxableSalaryPaise = addPaise(ytdTaxableSalaryPaise, taxable);

      taxAlreadyDeductedPaise = addPaise(taxAlreadyDeductedPaise, tds);
    } else {
      ytdTaxableSalaryPaise = subtractPaise(ytdTaxableSalaryPaise, taxable);

      taxAlreadyDeductedPaise = subtractPaise(taxAlreadyDeductedPaise, tds);
    }
  }

  // Actual finalized prior salary + current payroll + projected future months.
  const futureMonths = monthsRemainingIncludingCurrent - 1;

  const futureProjectedSalaryPaise =
    BigInt(projectedMonthlyTaxable) * BigInt(futureMonths);

  const projectedAnnualSalaryBigInt =
    BigInt(ytdTaxableSalaryPaise) +
    BigInt(currentTaxable) +
    futureProjectedSalaryPaise;

  if (
    projectedAnnualSalaryBigInt < 0n ||
    projectedAnnualSalaryBigInt > BigInt(Number.MAX_SAFE_INTEGER)
  ) {
    throw new ApiError(
      422,
      "Projected annual salary exceeds the safe integer range",
    );
  }

  return {
    taxYear,
    ytdTaxableSalaryPaise,
    currentPeriodTaxableSalaryPaise: currentTaxable,
    projectedMonthlyTaxableSalaryPaise: projectedMonthlyTaxable,
    projectedAnnualSalaryPaise: Number(projectedAnnualSalaryBigInt),
    approvedAnnualDeductionsPaise: approvedDeductions,
    taxAlreadyDeductedPaise,
    monthsRemainingIncludingCurrent,
    financialYearStart: financialYearStart.toJSDate(),
    financialYearEnd: financialYearEnd.toJSDate(),
  };
};
