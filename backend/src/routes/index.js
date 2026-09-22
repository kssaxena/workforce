import { Router } from "express";
import { companyRoutes } from "../modules/company/index.js";
import { authRoutes } from "../modules/auth/index.js";
import rbacRoutes from "../modules/rbac/routes/rbac.routes.js";
import { departmentRoutes } from "../modules/organization/index.js";

const router = Router();

router.use("/rbac", rbacRoutes);
router.use("/companies", companyRoutes);
router.use("/auth", authRoutes);
router.use("/departments", departmentRoutes);

export default router;
