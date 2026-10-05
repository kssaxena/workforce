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
  getDirectReportsController,
  getHierarchyController,
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

/*
 * Reporting hierarchy
 */
router.get(
  "/hierarchy",
  authorize(PERMISSIONS.EMPLOYEE_READ),
  getHierarchyController,
);

router.get(
  "/:employeeId/direct-reports",
  authorize(PERMISSIONS.EMPLOYEE_READ),
  getDirectReportsController,
);

router.get(
  "/:employeeId",
  authorize(PERMISSIONS.EMPLOYEE_READ),
  getEmployeeController,
);

export default router;
