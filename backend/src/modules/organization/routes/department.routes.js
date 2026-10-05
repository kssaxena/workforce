import { Router } from "express";

import authenticate from "../../auth/middleware/authenticate.js";
import authorize from "../../rbac/middleware/authorize.js";

// import { PERMISSIONS } from "../../rbac/constants/permissions.js";
import { PERMISSIONS } from "../../rbac/constants/permission.js";

import {
  createDepartmentController,
  getDepartmentsController,
  getDepartmentController,
  updateDepartmentController,
  deactivateDepartmentController,
} from "../controllers/department.controller.js";

import validate from "../../../core/middleware/validate.js";

import {
  createDepartmentSchema,
  updateDepartmentSchema,
} from "../validators/department.validator.js";

const router = Router();

router.use(authenticate);

router.post(
  "/",
  authorize(PERMISSIONS.ORGANIZATION_MANAGE),
  validate(createDepartmentSchema),
  createDepartmentController,
);

router.get(
  "/",
  authorize(PERMISSIONS.ORGANIZATION_READ),
  getDepartmentsController,
);

router.get(
  "/:departmentId",
  authorize(PERMISSIONS.ORGANIZATION_READ),
  getDepartmentController,
);

router.patch(
  "/:departmentId",
  authorize(PERMISSIONS.ORGANIZATION_MANAGE),
  validate(updateDepartmentSchema),
  updateDepartmentController,
);

router.delete(
  "/:departmentId",
  authorize(PERMISSIONS.ORGANIZATION_MANAGE),
  deactivateDepartmentController,
);

export default router;
