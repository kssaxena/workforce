import { Router } from "express";

import { login, refreshToken } from "../controllers/auth.controller.js";

import validate from "../../../core/middleware/validate.js";

import { loginSchema } from "../validators/auth.validator.js";

const router = Router();

router.post("/login", validate(loginSchema), login);

router.post("/refresh", refreshToken);

export default router;
