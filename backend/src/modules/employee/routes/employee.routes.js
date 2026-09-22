import { Router } from "express";

import authenticate from "../../auth/middleware/authenticate.js";
import authorize from "../../rbac/middleware/authorize.js";

import { PERMISSIONS } from "../../rbac/constants/permission.js";

import validate from "../../../core/middleware/validate.js";

import { createEmployeeSchema } from "../validators/employee.validator.js";

import {
  createEmployeeController,
  getEmployeeController,
  getEmployeesController,
} from "../controllers/employee.controller.js";

const router = Router();

router.use(authenticate);

router.post(
  "/",
  authorize(PERMISSIONS.EMPLOYEE_CREATE),
  validate(createEmployeeSchema),
  createEmployeeController,
);

router.get("/", authorize(PERMISSIONS.EMPLOYEE_READ), getEmployeesController);

router.get(
  "/:employeeId",
  authorize(PERMISSIONS.EMPLOYEE_READ),
  getEmployeeController,
);

export default router;
