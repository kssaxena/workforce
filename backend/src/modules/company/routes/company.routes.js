import { Router } from "express";

import validate from "../../../core/middleware/validate.js";

import {
  registerCompanySchema,
  updateAttendanceSettingsSchema,
  updateCompanyProfileSchema,
} from "../validators/company.validator.js";
import authenticate from "../../auth/middleware/authenticate.js";
import authorize from "../../rbac/middleware/authorize.js";
import { PERMISSIONS } from "../../rbac/constants/permission.js";

import registerCompanyController, {
  getAttendanceSettingsController,
  updateAttendanceSettingsController,
  getCompanyProfileController,
  updateCompanyProfileController,
} from "../controllers/company.controller.js";

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

router.get(
  "/profile",
  authenticate,
  authorize(PERMISSIONS.COMPANY_READ),
  getCompanyProfileController,
);

router.patch(
  "/profile",
  authenticate,
  authorize(PERMISSIONS.COMPANY_UPDATE),
  validate(updateCompanyProfileSchema),
  updateCompanyProfileController,
);

export default router;
