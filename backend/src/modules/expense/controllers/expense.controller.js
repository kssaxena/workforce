import asyncHandler from "../../../core/middleware/asyncHandler.js";
import ApiResponse from "../../../core/utils/ApiResponse.js";
import ApiError from "../../../core/errors/ApiError.js";

import Employee from "../../employee/models/employee.model.js";
import Expense from "../models/expense.model.js";
import ExpenseCategory from "../models/expenseCategory.model.js";

import {
  createExpenseCategory,
  getExpenseCategories,
  getExpenseCategoryById,
  updateExpenseCategory,
  createExpense,
  getEmployeeExpenses,
  getExpenseById,
  updateExpense,
} from "../services/expense.service.js";

import {
  createExpenseCategoryValidator,
  updateExpenseCategoryValidator,
  createExpenseValidator,
  updateExpenseValidator,
} from "../validators/expense.validator.js";

/*
|--------------------------------------------------------------------------
| Helper
|--------------------------------------------------------------------------
*/

const getEmployeeForUser = async ({ userId, companyId }) => {
  const employee = await Employee.findOne({
    userId,
    companyId,
    isActive: true,
    employmentStatus: "ACTIVE",
  });

  if (!employee) {
    throw new ApiError(404, "Active employee profile not found");
  }

  return employee;
};

/*
|--------------------------------------------------------------------------
| Expense Categories
|--------------------------------------------------------------------------
*/

/**
 * POST /expense/categories
 */
export const createCategory = asyncHandler(async (req, res) => {
  const { error, value } = createExpenseCategoryValidator.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    throw new ApiError(400, "Invalid expense category data", error.details);
  }

  const category = await createExpenseCategory({
    companyId: req.user.companyId,
    userId: req.user.userId,
    data: value,
  });

  return res
    .status(201)
    .json(
      new ApiResponse(201, category, "Expense category created successfully"),
    );
});

/**
 * GET /expense/categories
 */
export const getCategories = asyncHandler(async (req, res) => {
  const includeInactive = req.query.includeInactive === "true";

  const categories = await getExpenseCategories({
    companyId: req.user.companyId,
    includeInactive,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        categories,
        "Expense categories fetched successfully",
      ),
    );
});

/**
 * GET /expense/categories/:categoryId
 */
export const getCategory = asyncHandler(async (req, res) => {
  const category = await getExpenseCategoryById({
    companyId: req.user.companyId,
    categoryId: req.params.categoryId,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, category, "Expense category fetched successfully"),
    );
});

/**
 * PATCH /expense/categories/:categoryId
 */
export const updateCategory = asyncHandler(async (req, res) => {
  const { error, value } = updateExpenseCategoryValidator.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    throw new ApiError(400, "Invalid expense category data", error.details);
  }

  const category = await updateExpenseCategory({
    companyId: req.user.companyId,
    categoryId: req.params.categoryId,
    userId: req.user.userId,
    data: value,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, category, "Expense category updated successfully"),
    );
});

/*
|--------------------------------------------------------------------------
| Employee Expenses
|--------------------------------------------------------------------------
*/

/**
 * POST /expense
 *
 * Creates a DRAFT expense.
 */
export const create = asyncHandler(async (req, res) => {
  const { error, value } = createExpenseValidator.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    throw new ApiError(400, "Invalid expense data", error.details);
  }

  const employee = await getEmployeeForUser({
    userId: req.user.userId,
    companyId: req.user.companyId,
  });

  const expense = await createExpense({
    companyId: req.user.companyId,

    employeeId: employee._id,

    userId: req.user.userId,

    data: value,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, expense, "Expense created successfully"));
});

/**
 * GET /expense/my
 */
export const getMyExpenses = asyncHandler(async (req, res) => {
  const employee = await getEmployeeForUser({
    userId: req.user.userId,
    companyId: req.user.companyId,
  });

  const expenses = await getEmployeeExpenses({
    companyId: req.user.companyId,

    employeeId: employee._id,

    status: req.query.status,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, expenses, "Expenses fetched successfully"));
});

/**
 * GET /expense/:expenseId
 */
export const getOne = asyncHandler(async (req, res) => {
  const employee = await getEmployeeForUser({
    userId: req.user.userId,
    companyId: req.user.companyId,
  });

  const expense = await getExpenseById({
    companyId: req.user.companyId,

    employeeId: employee._id,

    expenseId: req.params.expenseId,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, expense, "Expense fetched successfully"));
});

/**
 * PATCH /expense/:expenseId
 */
export const update = asyncHandler(async (req, res) => {
  const { error, value } = updateExpenseValidator.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    throw new ApiError(400, "Invalid expense data", error.details);
  }

  const employee = await getEmployeeForUser({
    userId: req.user.userId,
    companyId: req.user.companyId,
  });

  const expense = await updateExpense({
    companyId: req.user.companyId,

    employeeId: employee._id,

    userId: req.user.userId,

    expenseId: req.params.expenseId,

    data: value,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, expense, "Expense updated successfully"));
});

/*
|--------------------------------------------------------------------------
| Submit Expense
|--------------------------------------------------------------------------
*/

/**
 * POST /expense/:expenseId/submit
 */
export const submit = asyncHandler(async (req, res) => {
  const employee = await getEmployeeForUser({
    userId: req.user.userId,
    companyId: req.user.companyId,
  });

  const expense = await Expense.findOne({
    _id: req.params.expenseId,
    companyId: req.user.companyId,
    employeeId: employee._id,
  });

  if (!expense) {
    throw new ApiError(404, "Expense not found");
  }

  if (expense.status !== "DRAFT") {
    throw new ApiError(400, "Only draft expenses can be submitted");
  }

  /*
   * Do not allow submission without
   * the required receipt.
   */
  const category = await ExpenseCategory.findOne({
    _id: expense.categoryId,
    companyId: req.user.companyId,
    isActive: true,
  });

  if (!category) {
    throw new ApiError(400, "Expense category is invalid or inactive");
  }

  if (
    category.requiresReceipt &&
    (!expense.receipts || expense.receipts.length === 0)
  ) {
    throw new ApiError(
      400,
      "A receipt is required before submitting this expense",
    );
  }

  expense.status = "PENDING";

  expense.submittedAt = new Date();

  expense.updatedBy = req.user.userId;

  await expense.save();

  return res
    .status(200)
    .json(new ApiResponse(200, expense, "Expense submitted successfully"));
});
