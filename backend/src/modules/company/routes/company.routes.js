import { Router } from "express";

import registerCompanyController, {
  getAttendanceSettingsController,
  updateAttendanceSettingsController,
} from "../controllers/company.controller.js";

import validate from "../../../core/middleware/validate.js";

import {
  registerCompanySchema,
  updateAttendanceSettingsSchema,
} from "../validators/company.validator.js";
import authenticate from "../../auth/middleware/authenticate.js";
import authorize from "../../rbac/middleware/authorize.js";
import { PERMISSIONS } from "../../rbac/constants/permission.js";

const router = Router();

router.post(
  "/register",
  validate(registerCompanySchema),
  registerCompanyController,
);

router.get(
  "/settings/attendance",
  authenticate,
  authorize(PERMISSIONS.ATTENDANCE_READ),
  getAttendanceSettingsController,
);

router.patch(
  "/settings/attendance",
  authenticate,
  authorize(PERMISSIONS.ORGANIZATION_MANAGE),
  validate(updateAttendanceSettingsSchema),
  updateAttendanceSettingsController,
);

export default router;
