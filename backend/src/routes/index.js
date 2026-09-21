import { Router } from "express";
import { companyRoutes } from "../modules/company/index.js";
import { authRoutes } from "../modules/auth/index.js";

const router = Router();

router.use("/companies", companyRoutes);
router.use("/auth", authRoutes);

export default router;
