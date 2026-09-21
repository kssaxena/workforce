import { Router } from "express";

import registerCompanyController from "../controllers/company.controller.js";

import validate from "../../../core/middleware/validate.js";

import { registerCompanySchema } from "../validators/company.validator.js";

const router = Router();

router.post(
  "/register",
  validate(registerCompanySchema),
  registerCompanyController,
);

export default router;
