import { Router } from "express";
import { companyRoutes } from "../modules/company/index.js";
import { authRoutes } from "../modules/auth/index.js";
import rbacRoutes from "../modules/rbac/routes/rbac.routes.js";
import {
  departmentRoutes,
  organizationUnitRoutes,
} from "../modules/organization/index.js";
import { employeeRoutes } from "../modules/employee/index.js";
import {
  attendancePolicyRoutes,
  attendanceRoutes,
  workScheduleRoutes,
} from "../modules/attendance/index.js";
import { holidayRoutes } from "../modules/holiday/index.js";
import { leaveRoutes } from "../modules/leave/index.js";
import { expenseRoutes } from "../modules/expense/index.js";
import { dashboardRoutes } from "../modules/dashboard/index.js";
import { auditRoutes } from "../modules/audit/index.js";

const router = Router();

router.use("/rbac", rbacRoutes);
router.use("/companies", companyRoutes);
router.use("/auth", authRoutes);
router.use("/departments", departmentRoutes);
router.use("/organization-units", organizationUnitRoutes);
router.use("/employees", employeeRoutes);
router.use("/attendance", attendanceRoutes);
router.use("/work-schedules", workScheduleRoutes);
router.use("/attendance-policy", attendancePolicyRoutes);
router.use("/holidays", holidayRoutes);
router.use("/leave", leaveRoutes);
router.use("/expenses", expenseRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/audit", auditRoutes);

export default router;
