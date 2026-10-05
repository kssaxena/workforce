import { Router } from "express";

import authenticate from "../../auth/middleware/authenticate.js";
import authorize from "../middleware/authorize.js";

import { getRoles, rbacTest } from "../controllers/rbac.controller.js";

import { PERMISSIONS } from "../constants/permission.js";

const router = Router();

router.get("/test", authenticate, authorize(PERMISSIONS.ROLE_READ), rbacTest);

router.get("/roles", authenticate, authorize(PERMISSIONS.ROLE_READ), getRoles);

export default router;
