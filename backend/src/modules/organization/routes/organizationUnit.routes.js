import { Router } from "express";

import authenticate from "../../auth/middleware/authenticate.js";
import authorize from "../../rbac/middleware/authorize.js";

import { PERMISSIONS } from "../../rbac/constants/permission.js";

import validate from "../../../core/middleware/validate.js";

import {
  createOrganizationUnitSchema,
  updateOrganizationUnitSchema,
} from "../validators/organizationUnit.validator.js";

import {
  createOrganizationUnitController,
  getOrganizationUnitsController,
  getOrganizationUnitController,
  updateOrganizationUnitController,
  deactivateOrganizationUnitController,
} from "../controllers/organizationUnit.controller.js";

const router = Router();

router.use(authenticate);

router.post(
  "/",
  authorize(PERMISSIONS.ORGANIZATION_MANAGE),
  validate(createOrganizationUnitSchema),
  createOrganizationUnitController,
);

router.get(
  "/",
  authorize(PERMISSIONS.ORGANIZATION_READ),
  getOrganizationUnitsController,
);

router.get(
  "/:unitId",
  authorize(PERMISSIONS.ORGANIZATION_READ),
  getOrganizationUnitController,
);

router.patch(
  "/:unitId",
  authorize(PERMISSIONS.ORGANIZATION_MANAGE),
  validate(updateOrganizationUnitSchema),
  updateOrganizationUnitController,
);

router.delete(
  "/:unitId",
  authorize(PERMISSIONS.ORGANIZATION_MANAGE),
  deactivateOrganizationUnitController,
);

export default router;
