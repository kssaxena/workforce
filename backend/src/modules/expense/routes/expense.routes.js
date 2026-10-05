import { Router } from "express";

import authenticate from "../../auth/middleware/authenticate.js";
import authorize from "../../rbac/middleware/authorize.js";

import {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  create,
  getMyExpenses,
  getOne,
  update,
  submit,
} from "../controllers/expense.controller.js";

const router = Router();

/*
|--------------------------------------------------------------------------
| Expense Categories
|--------------------------------------------------------------------------
*/

/*
 * Create category
 * HR / Admin
 */
router.post(
  "/categories",
  authenticate,
  authorize("EXPENSE_CREATE"),
  createCategory,
);

/*
 * Get categories
 */
router.get(
  "/categories",
  authenticate,
  authorize("EXPENSE_READ"),
  getCategories,
);

/*
 * Get single category
 */
router.get(
  "/categories/:categoryId",
  authenticate,
  authorize("EXPENSE_READ"),
  getCategory,
);

/*
 * Update category
 */
router.patch(
  "/categories/:categoryId",
  authenticate,
  authorize("EXPENSE_UPDATE"),
  updateCategory,
);

/*
|--------------------------------------------------------------------------
| Employee Expenses
|--------------------------------------------------------------------------
*/

/*
 * Create draft expense
 */
router.post("/", authenticate, authorize("EXPENSE_CREATE"), create);

/*
 * Get logged-in employee's expenses
 */
router.get("/my", authenticate, authorize("EXPENSE_READ"), getMyExpenses);

/*
 * Get one own expense
 */
router.get("/:expenseId", authenticate, authorize("EXPENSE_READ"), getOne);

/*
 * Update draft expense
 */
router.patch("/:expenseId", authenticate, authorize("EXPENSE_UPDATE"), update);

/*
 * Submit expense for approval
 */
router.post(
  "/:expenseId/submit",
  authenticate,
  authorize("EXPENSE_CREATE"),
  submit,
);

export default router;
