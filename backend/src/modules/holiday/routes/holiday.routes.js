import express from "express";

import authenticate from "../../auth/middleware/authenticate.js";
import authorize from "../../rbac/middleware/authorize.js";
import validate from "../../../core/middleware/validate.js";
import { PERMISSIONS } from "../../rbac/constants/permission.js";

import {
  createHolidayController,
  getHolidaysController,
  getHolidayByIdController,
  updateHolidayController,
  deactivateHolidayController,
} from "../controllers/holiday.controller.js";

import {
  createHolidaySchema,
  updateHolidaySchema,
} from "../validators/holiday.validator.js";

const router = express.Router();

router.use(authenticate);

router.post(
  "/",
  authorize(PERMISSIONS.HOLIDAY_CREATE),
  validate(createHolidaySchema),
  createHolidayController,
);

router.get("/", authorize(PERMISSIONS.HOLIDAY_READ), getHolidaysController);

router.get(
  "/:holidayId",
  authorize(PERMISSIONS.HOLIDAY_READ),
  getHolidayByIdController,
);

router.patch(
  "/:holidayId",
  authorize(PERMISSIONS.HOLIDAY_UPDATE),
  validate(updateHolidaySchema),
  updateHolidayController,
);

router.delete(
  "/:holidayId",
  authorize(PERMISSIONS.HOLIDAY_DELETE),
  deactivateHolidayController,
);

export default router;
