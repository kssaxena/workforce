import { Router } from "express";

import authenticate from "../../auth/middleware/authenticate.js";
import authorize from "../../rbac/middleware/authorize.js";

import { PERMISSIONS } from "../../rbac/constants/permission.js";

import validate from "../../../core/middleware/validate.js";

import { checkInSchema } from "../validators/attendance.validator.js";

import { checkInController } from "../controllers/attendance.controller.js";

const router = Router();

router.use(authenticate);

router.post(
  "/check-in",
  authorize(PERMISSIONS.ATTENDANCE_CREATE),
  validate(checkInSchema),
  checkInController,
);

export default router;
