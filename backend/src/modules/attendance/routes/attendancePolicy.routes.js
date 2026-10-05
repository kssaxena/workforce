import express from "express";

import authenticate from "../../auth/middleware/authenticate.js";
import authorize from "../../rbac/middleware/authorize.js";

import validate from "../../../core/middleware/validate.js";

import {
  createAttendancePolicySchema,
  updateAttendancePolicySchema,
} from "../validators/attendancePolicy.validator.js";

import {
  createAttendancePolicyController,
  getAttendancePolicyController,
  updateAttendancePolicyController,
} from "../controllers/attendancePolicy.controller.js";

// import { PERMISSIONS } from "../../rbac/constants/permissions.js";
import { PERMISSIONS } from "../../rbac/constants/permission.js";

const router = express.Router();

router.use(authenticate);

router.post(
  "/",
  authorize(PERMISSIONS.ORGANIZATION_MANAGE),
  validate(createAttendancePolicySchema),
  createAttendancePolicyController,
);

router.get(
  "/",
  authorize(PERMISSIONS.ATTENDANCE_READ),
  getAttendancePolicyController,
);

router.patch(
  "/",
  authorize(PERMISSIONS.ORGANIZATION_MANAGE),
  validate(updateAttendancePolicySchema),
  updateAttendancePolicyController,
);

export default router;
