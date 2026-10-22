export const PLAN_CATALOG = {
  FREE: {
    code: "FREE",
    name: "Free",
    employeeLimit: 10,
    pricing: {
      monthlyPerEmployee: 0,
      annualPerEmployeeMonthlyEquivalent: 0,
    },
    features: {
      employeeDirectory: true,
      attendance: true,
      leaveManagement: true,
      holidays: true,
      basicReports: true,
      workSchedules: false,
      gpsAttendance: false,
      expenseManagement: false,
      advancedReports: false,
      auditLogAccess: false,
      advancedApprovals: false,
      dataExports: false,
    },
  },

  BEGINNER: {
    code: "BEGINNER",
    name: "Beginner",
    employeeLimit: 50,
    pricing: {
      monthlyPerEmployee: 69,
      annualPerEmployeeMonthlyEquivalent: 59,
    },
    features: {
      employeeDirectory: true,
      attendance: true,
      leaveManagement: true,
      holidays: true,
      basicReports: true,
      workSchedules: true,
      gpsAttendance: true,
      expenseManagement: false,
      advancedReports: false,
      auditLogAccess: false,
      advancedApprovals: false,
      dataExports: false,
    },
  },

  INTERMEDIATE: {
    code: "INTERMEDIATE",
    name: "Intermediate",
    employeeLimit: 250,
    pricing: {
      monthlyPerEmployee: 119,
      annualPerEmployeeMonthlyEquivalent: 99,
    },
    features: {
      employeeDirectory: true,
      attendance: true,
      leaveManagement: true,
      holidays: true,
      basicReports: true,
      workSchedules: true,
      gpsAttendance: true,
      expenseManagement: true,
      advancedReports: true,
      auditLogAccess: true,
      advancedApprovals: false,
      dataExports: true,
    },
  },

  PRO: {
    code: "PRO",
    name: "Pro",
    employeeLimit: 1000,
    pricing: {
      monthlyPerEmployee: 219,
      annualPerEmployeeMonthlyEquivalent: 179,
    },
    features: {
      employeeDirectory: true,
      attendance: true,
      leaveManagement: true,
      holidays: true,
      basicReports: true,
      workSchedules: true,
      gpsAttendance: true,
      expenseManagement: true,
      advancedReports: true,
      auditLogAccess: true,
      advancedApprovals: true,
      dataExports: true,
    },
  },
};

// Preserve compatibility with companies using the previous plan names.
// These aliases can be removed after a deliberate subscription migration.
export const LEGACY_PLAN_ALIASES = {
  STARTER: "BEGINNER",
  GROWTH: "INTERMEDIATE",
  ENTERPRISE: "PRO",
};

export const resolvePlanCode = (planCode) => {
  const normalized = String(planCode || "FREE").toUpperCase();
  return LEGACY_PLAN_ALIASES[normalized] || normalized;
};

export const getPlanDefinition = (planCode) => {
  const resolvedCode = resolvePlanCode(planCode);
  return PLAN_CATALOG[resolvedCode] || null;
};
