import { Router } from "express";

import authenticate from "../../auth/middleware/authenticate.js";
import authorize from "../middleware/authorize.js";

import { rbacTest } from "../controllers/rbac.controller.js";

import { PERMISSIONS } from "../constants/permission.js";

const router = Router();

router.get("/test", authenticate, authorize(PERMISSIONS.ROLE_READ), rbacTest);

export default router;
