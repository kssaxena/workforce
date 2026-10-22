import express from "express";

import {
  createWorkScheduleController,
  getWorkSchedulesController,
  getWorkScheduleByIdController,
  updateWorkScheduleController,
  deactivateWorkScheduleController,
} from "../controllers/workSchedule.controller.js";

import authenticate from "../../auth/middleware/authenticate.js";
import authorize from "../../rbac/middleware/authorize.js";

import validate from "../../../core/middleware/validate.js";

import {
  createWorkScheduleSchema,
  updateWorkScheduleSchema,
} from "../validators/workSchedule.validator.js";

import { PERMISSIONS } from "../../rbac/constants/permission.js";

import requireFeature from "../../subscription/middleware/requireFeature.js";

const router = express.Router();

router.use(authenticate);

router.post(
  "/",
  authorize(PERMISSIONS.ORGANIZATION_MANAGE),
  requireFeature("workSchedules"),
  validate(createWorkScheduleSchema),
  createWorkScheduleController,
);

router.get(
  "/",
  authorize(PERMISSIONS.ORGANIZATION_READ),
  getWorkSchedulesController,
);

router.get(
  "/:scheduleId",
  authorize(PERMISSIONS.ORGANIZATION_READ),
  getWorkScheduleByIdController,
);

router.patch(
  "/:scheduleId",
  authorize(PERMISSIONS.ORGANIZATION_MANAGE),
  requireFeature("workSchedules"),
  validate(updateWorkScheduleSchema),
  updateWorkScheduleController,
);

router.delete(
  "/:scheduleId",
  authorize(PERMISSIONS.ORGANIZATION_MANAGE),
  requireFeature("workSchedules"),
  deactivateWorkScheduleController,
);

export default router;
