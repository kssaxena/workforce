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

export default router;
