import { Router } from "express";

import validate from "../../../core/middleware/validate.js";

import authenticate from "../middleware/authenticate.js";

import { login, me, refresh, logout } from "../controllers/auth.controller.js";

import { loginSchema } from "../validators/auth.validator.js";

const router = Router();

router.post("/login", validate(loginSchema), login);

router.post("/refresh", refresh);

router.get("/me", authenticate, me);

router.post("/logout", authenticate, logout);

export default router;
