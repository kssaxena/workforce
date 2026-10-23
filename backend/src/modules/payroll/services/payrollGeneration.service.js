import mongoose from "mongoose";
import { DateTime } from "luxon";

import ApiError from "../../../core/errors/ApiError.js";
import Company from "../../company/models/company.model.js";
import Employee from "../../employee/models/employee.model.js";
import Attendance from "../../attendance/models/attendance.model.js";
import { WorkSchedule } from "../../attendance/models/workSchedule.model.js";
import Holiday from "../../holiday/models/holiday.model.js";
import LeaveRequest from "../../leave/models/leaveRequest.model.js";
import LeaveType from "../../leave/models/leaveType.model.js";
import { createAuditLog } from "../../audit/services/audit.service.js";

import SalaryStructure from "../models/salaryStructure.model.js";
import PayrollPolicy from "../models/payrollPolicy.model.js";
import PayrollComplianceProfile from "../models/payrollComplianceProfile.model.js";
import PayrollRun from "../models/payrollRun.model.js";

import {
  PAYROLL_CALCULATION_VERSION,
  prorateMonthlyAmount,
} from "./payrollCalculation.service.js";

import { calculateEmployeeStatutoryPayroll } from "./statutoryPayroll.service.js";
import EmployeePayrollProfile from "../models/employeePayrollProfile.model.js";

const BLOCKING = (code, message) => ({
  code,
  message,
  blocking: true,
});

const dateKey = (date, timezone) =>
  DateTime.fromJSDate(new Date(date), { zone: "utc" })
    .setZone(timezone)
    .toISODate();

const overlaps = (aStart, aEnd, bStart, bEnd) =>
  new Date(aStart) <= new Date(bEnd) && new Date(aEnd) >= new Date(bStart);

const dayRange = (start, end, timezone) => {
  const first = DateTime.fromJSDate(start, { zone: timezone }).startOf("day");
  const last = DateTime.fromJSDate(end, { zone: timezone }).startOf("day");

  const result = [];
  for (
    let current = first;
    current <= last;
    current = current.plus({ days: 1 })
  ) {
    result.push(current);
  }
  return result;
};

const addMoney = (a, b) => {
  const sum = BigInt(a) + BigInt(b);
  if (sum > BigInt(Number.MAX_SAFE_INTEGER)) {
    throw new ApiError(400, "Payroll total exceeds the safe integer range");
  }
  return Number(sum);
};

const assertUniqueComponents = (components, employeeCode) => {
  const codes = components.map((component) => component.code);
  if (new Set(codes).size !== codes.length) {
    throw new ApiError(
      422,
      `Salary structure for ${employeeCode} has duplicate component codes`,
    );
  }

  const reserved = new Set(["PF", "ESI", "PT", "TDS"]);
  if (codes.some((code) => reserved.has(code))) {
    throw new ApiError(
      422,
      `Statutory components must not be manually duplicated in salary structure for ${employeeCode}`,
    );
  }
};

export const generatePayrollDraft = async ({
  companyId,
  userId,
  year,
  month,
  ipAddress,
  userAgent,
}) => {
  if (
    !mongoose.isValidObjectId(companyId) ||
    !mongoose.isValidObjectId(userId)
  ) {
    throw new ApiError(400, "Invalid company or user ID");
  }

  if (
    !Number.isInteger(year) ||
    year < 2000 ||
    year > 2200 ||
    !Number.isInteger(month) ||
    month < 1 ||
    month > 12
  ) {
    throw new ApiError(400, "A valid payroll year and month are required");
  }

  const company = await Company.findById(companyId)
    .select("status settings.timezone")
    .lean();

  if (!company) throw new ApiError(404, "Company not found");
  if (company.status !== "ACTIVE") {
    throw new ApiError(409, "Payroll is unavailable for an inactive company");
  }

  const timezone = company.settings?.timezone || "Asia/Kolkata";
  const periodStartDT = DateTime.fromObject(
    { year, month, day: 1 },
    { zone: timezone },
  ).startOf("day");
  const periodEndDT = periodStartDT.endOf("month");

  if (!periodStartDT.isValid || !periodEndDT.isValid) {
    throw new ApiError(400, "Invalid payroll period or company timezone");
  }

  const periodStart = periodStartDT.toJSDate();
  const periodEnd = periodEndDT.toJSDate();
  const calendarDays = periodStartDT.daysInMonth;

  const existingRun = await PayrollRun.findOne({
    companyId,
    periodStart,
    periodEnd,
  });

  if (existingRun?.status === "FINALIZED") {
    throw new ApiError(409, "This payroll period has already been finalized");
  }

  const [policy, complianceProfile] = await Promise.all([
    PayrollPolicy.findOne({
      companyId,
      status: "ACTIVE",
      effectiveFrom: { $lte: periodEnd },
      $or: [
        { effectiveTo: null },
        { effectiveTo: { $exists: false } },
        { effectiveTo: { $gte: periodStart } },
      ],
    }).lean(),

    PayrollComplianceProfile.findOne({ companyId }).lean(),
  ]);

  if (!policy) {
    throw new ApiError(
      422,
      "Configure and activate an effective payroll policy before generating payroll",
    );
  }

  const employees = await Employee.find({
    companyId,
    joiningDate: { $lte: periodEnd },
    $or: [
      { isActive: true },
      { exitDate: { $gte: periodStart, $lte: periodEnd } },
    ],
  }).lean();

  if (employees.length === 0) {
    throw new ApiError(
      422,
      "No eligible employee records exist for this payroll period",
    );
  }

  const schedules = await WorkSchedule.find({
    companyId,
    isActive: true,
  }).lean();

  const scheduleMap = new Map(
    schedules.map((schedule) => [String(schedule._id), schedule]),
  );

  const attendance = await Attendance.find({
    companyId,
    date: { $gte: periodStart, $lte: periodEnd },
  }).lean();

  const attendanceMap = new Map();
  for (const record of attendance) {
    const key = `${record.employeeId}:${dateKey(record.date, timezone)}`;
    if (attendanceMap.has(key)) {
      throw new ApiError(
        409,
        "Duplicate attendance records detected; resolve them before payroll",
      );
    }
    attendanceMap.set(key, record);
  }

  const holidays = await Holiday.find({
    companyId,
    isActive: true,
    date: { $gte: periodStart, $lte: periodEnd },
  }).lean();

  const holidayMap = new Map(
    holidays.map((holiday) => [dateKey(holiday.date, timezone), holiday]),
  );

  const leaveRequests = await LeaveRequest.find({
    companyId,
    status: "APPROVED",
    startDate: { $lte: periodEnd },
    endDate: { $gte: periodStart },
  }).lean();

  const leaveTypes = await LeaveType.find({ companyId }).lean();
  const leaveTypeMap = new Map(
    leaveTypes.map((type) => [String(type._id), type]),
  );

  const structures = await SalaryStructure.find({
    companyId,
    status: "ACTIVE",
    effectiveFrom: { $lte: periodEnd },
    $or: [
      { effectiveTo: null },
      { effectiveTo: { $exists: false } },
      { effectiveTo: { $gte: periodStart } },
    ],
  }).lean();

  const structuresByEmployee = new Map();
  for (const structure of structures) {
    const key = String(structure.employeeId);
    const list = structuresByEmployee.get(key) || [];
    list.push(structure);
    structuresByEmployee.set(key, list);
  }

  const periodDays = dayRange(periodStart, periodEnd, timezone);
  const snapshots = [];

  for (const employee of employees) {
    const employeeId = String(employee._id);
    const issues = [];

    if (
      ["RESIGNED", "TERMINATED"].includes(employee.employmentStatus) &&
      !employee.exitDate
    ) {
      issues.push(
        BLOCKING(
          "EXIT_DATE_MISSING",
          "Resigned or terminated employee has no recorded exit date.",
        ),
      );
    }

    const employeeStructures = structuresByEmployee.get(employeeId) || [];

    if (employeeStructures.length !== 1) {
      issues.push(
        BLOCKING(
          employeeStructures.length === 0
            ? "SALARY_STRUCTURE_MISSING"
            : "SALARY_STRUCTURE_OVERLAP",
          employeeStructures.length === 0
            ? "No active salary structure covers this payroll period."
            : "Multiple active salary structures overlap this period.",
        ),
      );
      snapshots.push({
        employeeId: employee._id,
        employeeCode: employee.employeeCode,
        employeeName: [employee.firstName, employee.lastName]
          .filter(Boolean)
          .join(" "),
        joiningDate: employee.joiningDate,
        exitDate: employee.exitDate || null,
        validationIssues: issues,
      });
      continue;
    }

    const structure = employeeStructures[0];
    if (
      new Date(structure.effectiveFrom) > periodStart ||
      (structure.effectiveTo && new Date(structure.effectiveTo) < periodEnd)
    ) {
      issues.push(
        BLOCKING(
          "SALARY_STRUCTURE_PARTIAL_PERIOD",
          "The salary structure changes or begins within this period. Split-period salary calculation is required before finalization.",
        ),
      );
    }
    assertUniqueComponents(structure.components, employee.employeeCode);

    const schedule = employee.workScheduleId
      ? scheduleMap.get(String(employee.workScheduleId))
      : null;

    if (!schedule) {
      issues.push(
        BLOCKING(
          "WORK_SCHEDULE_MISSING",
          "Employee has no active work schedule for payroll calculation.",
        ),
      );
    }

    let eligibleCalendarDays = 0;
    let scheduledWorkingDays = 0;
    let paidDayUnits = 0;
    let unpaidDayUnits = 0;

    for (const day of periodDays) {
      const date = day.toJSDate();
      const key = `${employeeId}:${day.toISODate()}`;
      const record = attendanceMap.get(key);
      const holiday = holidayMap.get(day.toISODate());

      if (date < new Date(employee.joiningDate).setHours(0, 0, 0, 0)) {
        continue;
      }

      if (employee.exitDate && date > new Date(employee.exitDate)) {
        continue;
      }

      eligibleCalendarDays += 1;

      if (!schedule) continue;

      const scheduleDay = schedule.days.find(
        (item) => item.dayOfWeek === day.weekday % 7,
      );

      if (!scheduleDay) {
        issues.push(
          BLOCKING(
            "SCHEDULE_DAY_MISSING",
            `Work schedule is incomplete for ${day.toISODate()}.`,
          ),
        );
        continue;
      }

      if (!scheduleDay.isWorkingDay) {
        if (record && record.status !== "WEEK_OFF" && !record.overtimeMinutes) {
          issues.push(
            BLOCKING(
              "NON_WORKING_DAY_ATTENDANCE",
              `Attendance on a non-working day needs review (${day.toISODate()}).`,
            ),
          );
        }
        continue;
      }

      scheduledWorkingDays += 1;

      if (holiday) {
        if (policy.paidHolidayTreatment === "REVIEW_REQUIRED") {
          issues.push(
            BLOCKING(
              "HOLIDAY_POLICY_REVIEW",
              `Holiday pay policy requires review for ${day.toISODate()}.`,
            ),
          );
          continue;
        }

        if (record && !["HOLIDAY", "PRESENT"].includes(record.status)) {
          issues.push(
            BLOCKING(
              "HOLIDAY_ATTENDANCE_CONFLICT",
              `Attendance conflicts with holiday record on ${day.toISODate()}.`,
            ),
          );
          continue;
        }

        if (policy.paidHolidayTreatment === "PAID") paidDayUnits += 1;
        continue;
      }

      const approvedLeaves = leaveRequests.filter(
        (leave) =>
          String(leave.employeeId) === employeeId &&
          overlaps(leave.startDate, leave.endDate, date, date),
      );

      if (approvedLeaves.length > 1) {
        issues.push(
          BLOCKING(
            "OVERLAPPING_APPROVED_LEAVE",
            `Multiple approved leave requests overlap ${day.toISODate()}.`,
          ),
        );
        continue;
      }

      const approvedLeave = approvedLeaves[0];
      const leaveType = approvedLeave
        ? leaveTypeMap.get(String(approvedLeave.leaveTypeId))
        : null;

      if (approvedLeave && !leaveType) {
        issues.push(
          BLOCKING(
            "LEAVE_TYPE_MISSING",
            `Approved leave type is unavailable for ${day.toISODate()}.`,
          ),
        );
        continue;
      }

      if (record?.status === "ON_LEAVE" && !approvedLeave) {
        issues.push(
          BLOCKING(
            "UNAPPROVED_LEAVE_ATTENDANCE",
            `Attendance says leave but no approved leave exists for ${day.toISODate()}.`,
          ),
        );
        continue;
      }

      if (approvedLeave) {
        const rangeDays = dayRange(
          DateTime.fromJSDate(approvedLeave.startDate, { zone: timezone })
            .startOf("day")
            .toJSDate(),
          DateTime.fromJSDate(approvedLeave.endDate, { zone: timezone })
            .startOf("day")
            .toJSDate(),
          timezone,
        ).length;

        if (approvedLeave.totalDays < rangeDays) {
          issues.push(
            BLOCKING(
              "PARTIAL_LEAVE_DATES_AMBIGUOUS",
              `Leave request has partial-day totals but does not identify the exact partial date (${day.toISODate()}).`,
            ),
          );
          continue;
        }

        if (leaveType.isPaid) {
          paidDayUnits += 1;
        } else if (policy.unpaidLeaveTreatment === "DEDUCT") {
          unpaidDayUnits += 1;
        } else {
          issues.push(
            BLOCKING(
              "UNPAID_LEAVE_POLICY_REVIEW",
              `Unpaid leave treatment needs review for ${day.toISODate()}.`,
            ),
          );
        }
        continue;
      }

      if (!record) {
        issues.push(
          BLOCKING(
            "ATTENDANCE_MISSING",
            `No attendance or approved leave record exists for scheduled day ${day.toISODate()}.`,
          ),
        );
        continue;
      }

      switch (record.status) {
        case "PRESENT":
          paidDayUnits += 1;
          break;

        case "HALF_DAY":
          paidDayUnits += policy.halfDayFactor;
          unpaidDayUnits += 1 - policy.halfDayFactor;
          break;

        case "ABSENT":
          if (policy.absenceTreatment === "UNPAID") {
            unpaidDayUnits += 1;
          } else {
            issues.push(
              BLOCKING(
                "ABSENCE_POLICY_REVIEW",
                `Absence treatment needs review for ${day.toISODate()}.`,
              ),
            );
          }
          break;

        case "HOLIDAY":
          issues.push(
            BLOCKING(
              "HOLIDAY_RECORD_WITHOUT_HOLIDAY",
              `Attendance is marked HOLIDAY but no company holiday exists for ${day.toISODate()}.`,
            ),
          );
          break;

        case "WEEK_OFF":
          issues.push(
            BLOCKING(
              "WEEK_OFF_SCHEDULE_CONFLICT",
              `Attendance is marked WEEK_OFF on a scheduled working day (${day.toISODate()}).`,
            ),
          );
          break;

        case "ON_LEAVE":
          issues.push(
            BLOCKING(
              "LEAVE_RECORD_UNRESOLVED",
              `Leave record could not be reconciled for ${day.toISODate()}.`,
            ),
          );
          break;

        default:
          issues.push(
            BLOCKING(
              "UNKNOWN_ATTENDANCE_STATUS",
              `Unrecognized attendance status for ${day.toISODate()}.`,
            ),
          );
      }

      if (record.overtimeMinutes > 0) {
        issues.push(
          BLOCKING(
            "OVERTIME_APPROVAL_REQUIRED",
            `Overtime on ${day.toISODate()} needs an approved overtime policy and approval record.`,
          ),
        );
      }
    }

    const denominator =
      policy.prorationBasis === "CALENDAR_DAYS"
        ? calendarDays
        : scheduledWorkingDays;

    const payableUnits =
      policy.prorationBasis === "CALENDAR_DAYS"
        ? Math.max(0, eligibleCalendarDays - unpaidDayUnits)
        : Math.max(0, paidDayUnits);

    if (denominator <= 0) {
      issues.push(
        BLOCKING(
          "PRORATION_DENOMINATOR_ZERO",
          "Cannot calculate salary because the proration denominator is zero.",
        ),
      );
    }

    const earnings = [];
    const deductions = [];
    let grossEarningsPaise = 0;
    let totalDeductionsPaise = 0;

    for (const component of structure.components) {
      const amountPaise =
        denominator > 0
          ? prorateMonthlyAmount({
              monthlyAmountPaise: component.amountPaise,
              eligibleCalendarDays: Math.min(payableUnits, denominator),
              periodCalendarDays: denominator,
            })
          : 0;

      const item = {
        code: component.code,
        label: component.name,
        amountPaise,
        source: "SALARY_STRUCTURE",
      };

      if (component.type === "EARNING") {
        earnings.push({ ...item, category: "EARNING" });
        grossEarningsPaise = addMoney(grossEarningsPaise, amountPaise);
      } else {
        deductions.push({ ...item, category: "DEDUCTION" });
        totalDeductionsPaise = addMoney(totalDeductionsPaise, amountPaise);
      }
    }

    // Statutory calculation integration
    // Uses the prorated earnings already calculated above.

    let statutorySnapshot = null;

    try {
      const employeeProfile = await EmployeePayrollProfile.findOne({
        companyId,
        employeeId: employee._id,
      }).lean();

      if (!employeeProfile) {
        throw new ApiError(
          422,
          `Employee payroll compliance profile is missing for ${employee.employeeCode}`,
        );
      }

      if (!complianceProfile?.stateCode) {
        throw new ApiError(
          422,
          "Company Professional Tax jurisdiction is not configured",
        );
      }

      // The salary component amounts here have already been prorated.
      const statutoryComponents = earnings.map((item) => ({
        code: item.code,
        amountPaise: item.amountPaise,
      }));

      // Annual TDS projection and year-to-date tax inputs are not yet
      // connected in this generator. Do not invent values or assume zero.
      throw new ApiError(
        422,
        "TDS annual projection is not connected yet; statutory payroll cannot be finalized",
      );

      // Connect calculateEmployeeStatutoryPayroll here once the verified
      // TDS projection inputs and year-to-date tax ledger are available.
    } catch (error) {
      issues.push(
        BLOCKING(
          "STATUTORY_CALCULATION_FAILED",
          error.message || "Statutory payroll calculation failed",
        ),
      );
    }

    // Preserve the existing salary snapshot.
    // Statutory deductions are added only after all required calculations
    // succeed, so we cannot accidentally deduct them twice.
    const statutory = statutorySnapshot?.results ?? null;
    const statutoryRuleSetVersions = statutorySnapshot?.ruleSetVersions ?? null;

    snapshots.push({
      employeeId: employee._id,
      employeeCode: employee.employeeCode,
      employeeName: [employee.firstName, employee.lastName]
        .filter(Boolean)
        .join(" "),
      salaryStructureId: structure._id,
      salaryStructureUpdatedAt: structure.updatedAt,
      joiningDate: employee.joiningDate,
      exitDate: employee.exitDate || null,
      periodCalendarDays: calendarDays,
      eligibleCalendarDays,
      scheduledWorkingDays,
      paidDays: paidDayUnits,
      unpaidDays: unpaidDayUnits,
      earnings,
      deductions,
      employerContributions: [],
      grossEarningsPaise,
      totalDeductionsPaise,
      employerContributionsPaise: 0,
      netPayablePaise: Math.max(0, grossEarningsPaise - totalDeductionsPaise),
      calculationVersion: PAYROLL_CALCULATION_VERSION,
      inputFingerprint: [
        String(structure._id),
        String(structure.updatedAt?.getTime() || 0),
        String(policy.updatedAt?.getTime() || 0),
        String(employee.updatedAt?.getTime() || 0),
        year,
        month,
      ].join(":"),
      validationIssues: issues,
    });
  }

  const allIssues = snapshots.flatMap((snapshot) =>
    (snapshot.validationIssues || []).map((issue) => ({
      employeeCode: snapshot.employeeCode,
      ...issue,
    })),
  );

  const runData = {
    companyId,
    periodStart,
    periodEnd,
    status: "DRAFT",
    employees: snapshots,
    totals: {
      employeeCount: snapshots.length,
      grossEarningsPaise: snapshots.reduce(
        (sum, item) => addMoney(sum, item.grossEarningsPaise || 0),
        0,
      ),
      employeeDeductionsPaise: snapshots.reduce(
        (sum, item) => addMoney(sum, item.totalDeductionsPaise || 0),
        0,
      ),
      employerContributionsPaise: 0,
      netPayablePaise: snapshots.reduce(
        (sum, item) => addMoney(sum, item.netPayablePaise || 0),
        0,
      ),
    },
    complianceSnapshot: {
      rulesetVersion: complianceProfile?.complianceRulesetVersion || null,
      profileUpdatedAt: complianceProfile?.updatedAt || null,
      verifiedAt: complianceProfile?.complianceReviewedAt || null,
      stateCode: complianceProfile?.stateCode || null,
    },
    generatedBy: userId,
    calculationVersion: PAYROLL_CALCULATION_VERSION,
  };

  let payrollRun;

  try {
    if (existingRun) {
      if (existingRun.status !== "DRAFT" && existingRun.status !== "REVIEW") {
        throw new ApiError(
          409,
          "Only draft or review payroll runs can be regenerated",
        );
      }

      existingRun.set(runData);
      payrollRun = await existingRun.save();
    } else {
      payrollRun = await PayrollRun.create(runData);
    }
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(
        409,
        "A payroll run for this company and period already exists; refresh and review it",
      );
    }
    throw error;
  }

  await createAuditLog({
    companyId,
    actorId: userId,
    action: "PAYROLL_DRAFT_GENERATED",
    module: "payroll",
    entityType: "PayrollRun",
    entityId: payrollRun._id,
    description: "Payroll draft generated from company records",
    metadata: {
      year,
      month,
      employeeCount: snapshots.length,
      blockingIssueCount: allIssues.length,
    },
    ipAddress,
    userAgent,
  });

  return {
    payrollRun,
    blockingIssues: allIssues,
    canReview: allIssues.length === 0,
  };
};
