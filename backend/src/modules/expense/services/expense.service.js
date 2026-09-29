import mongoose from "mongoose";

import Company from "../../company/models/company.model.js";
import Employee from "../../employee/models/employee.model.js";

import Expense from "../models/expense.model.js";
import ExpenseCategory from "../models/expenseCategory.model.js";

import ApiError from "../../../core/errors/ApiError.js";

/*
|--------------------------------------------------------------------------
| Default Expense Categories
|--------------------------------------------------------------------------
*/

const DEFAULT_EXPENSE_CATEGORIES = [
  {
    name: "Travel",
    code: "TRAVEL",
    description: "Business travel and transportation expenses",
    requiresReceipt: true,
  },
  {
    name: "Fuel",
    code: "FUEL",
    description: "Fuel and petrol expenses",
    requiresReceipt: true,
  },
  {
    name: "Food",
    code: "FOOD",
    description: "Meals and food expenses incurred for business purposes",
    requiresReceipt: true,
  },
  {
    name: "Accommodation",
    code: "ACCOMMODATION",
    description: "Hotel and accommodation expenses",
    requiresReceipt: true,
  },
  {
    name: "Office Supplies",
    code: "OFFICE_SUPPLIES",
    description: "Office stationery and other supplies",
    requiresReceipt: true,
  },
  {
    name: "Communication",
    code: "COMMUNICATION",
    description: "Business phone, internet and communication expenses",
    requiresReceipt: true,
  },
  {
    name: "Other",
    code: "OTHER",
    description: "Other business-related expenses",
    requiresReceipt: false,
  },
];

/*
|--------------------------------------------------------------------------
| Initialize Default Expense Categories
|--------------------------------------------------------------------------
*/

export const initializeDefaultExpenseCategories = async ({
  companyId,
  userId,
  session = null,
}) => {
  const operations = DEFAULT_EXPENSE_CATEGORIES.map((category) => ({
    updateOne: {
      filter: {
        companyId,
        code: category.code,
      },

      update: {
        $setOnInsert: {
          companyId,
          ...category,
          isActive: true,
          createdBy: userId,
        },

        $set: {
          updatedBy: userId,
        },
      },

      upsert: true,
    },
  }));

  await ExpenseCategory.bulkWrite(
    operations,
    session ? { session } : undefined,
  );

  return ExpenseCategory.find({
    companyId,
    isActive: true,
  }).session(session);
};

/*
|--------------------------------------------------------------------------
| Create Expense Category
|--------------------------------------------------------------------------
*/

export const createExpenseCategory = async ({ companyId, userId, data }) => {
  const existingCategory = await ExpenseCategory.findOne({
    companyId,
    code: data.code,
  });

  if (existingCategory) {
    throw new ApiError(409, "Expense category with this code already exists");
  }

  const category = await ExpenseCategory.create({
    companyId,
    name: data.name,
    code: data.code,
    description: data.description || "",
    requiresReceipt: data.requiresReceipt ?? true,
    isActive: data.isActive ?? true,
    createdBy: userId,
    updatedBy: userId,
  });

  return category;
};

/*
|--------------------------------------------------------------------------
| Get Expense Categories
|--------------------------------------------------------------------------
*/

export const getExpenseCategories = async ({
  companyId,
  includeInactive = false,
}) => {
  const filter = {
    companyId,
  };

  if (!includeInactive) {
    filter.isActive = true;
  }

  return ExpenseCategory.find(filter).sort({
    name: 1,
  });
};

/*
|--------------------------------------------------------------------------
| Get Expense Category
|--------------------------------------------------------------------------
*/

export const getExpenseCategoryById = async ({ companyId, categoryId }) => {
  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    throw new ApiError(400, "Invalid expense category ID");
  }

  const category = await ExpenseCategory.findOne({
    _id: categoryId,
    companyId,
  });

  if (!category) {
    throw new ApiError(404, "Expense category not found");
  }

  return category;
};

/*
|--------------------------------------------------------------------------
| Update Expense Category
|--------------------------------------------------------------------------
*/

export const updateExpenseCategory = async ({
  companyId,
  categoryId,
  userId,
  data,
}) => {
  const category = await getExpenseCategoryById({
    companyId,
    categoryId,
  });

  if (data.code && data.code !== category.code) {
    const duplicate = await ExpenseCategory.findOne({
      companyId,
      code: data.code,
      _id: {
        $ne: category._id,
      },
    });

    if (duplicate) {
      throw new ApiError(409, "Expense category with this code already exists");
    }
  }

  Object.assign(category, data);

  category.updatedBy = userId;

  await category.save();

  return category;
};

/*
|--------------------------------------------------------------------------
| Validate Company
|--------------------------------------------------------------------------
*/

const validateCompany = async ({ companyId }) => {
  const company = await Company.findById(companyId).select("_id settings");

  if (!company) {
    throw new ApiError(404, "Company not found");
  }

  return company;
};

/*
|--------------------------------------------------------------------------
| Validate Employee
|--------------------------------------------------------------------------
*/

const validateEmployee = async ({ companyId, employeeId }) => {
  const employee = await Employee.findOne({
    _id: employeeId,
    companyId,
    isActive: true,
    employmentStatus: "ACTIVE",
  });

  if (!employee) {
    throw new ApiError(404, "Active employee not found");
  }

  return employee;
};

/*
|--------------------------------------------------------------------------
| Validate Expense Category
|--------------------------------------------------------------------------
*/

const validateExpenseCategory = async ({ companyId, categoryId }) => {
  const category = await ExpenseCategory.findOne({
    _id: categoryId,
    companyId,
    isActive: true,
  });

  if (!category) {
    throw new ApiError(400, "Invalid or inactive expense category");
  }

  return category;
};

/*
|--------------------------------------------------------------------------
| Create Expense
|--------------------------------------------------------------------------
*/

export const createExpense = async ({
  companyId,
  employeeId,
  userId,
  data,
}) => {
  await validateCompany({
    companyId,
  });

  await validateEmployee({
    companyId,
    employeeId,
  });

  const category = await validateExpenseCategory({
    companyId,
    categoryId: data.categoryId,
  });

  if (
    category.requiresReceipt &&
    (!data.receipts || data.receipts.length === 0)
  ) {
    throw new ApiError(400, "A receipt is required for this expense category");
  }

  const company = await Company.findById(companyId).select("settings.currency");

  const currency = data.currency || company?.settings?.currency || "INR";

  const expense = await Expense.create({
    companyId,
    employeeId,
    categoryId: category._id,

    expenseDate: data.expenseDate,

    amount: data.amount,

    currency,

    title: data.title,

    description: data.description || "",

    receipts: data.receipts || [],

    status: "DRAFT",

    createdBy: userId,
    updatedBy: userId,
  });

  return expense;
};

/*
|--------------------------------------------------------------------------
| Get Employee Expenses
|--------------------------------------------------------------------------
*/

export const getEmployeeExpenses = async ({
  companyId,
  employeeId,
  status,
}) => {
  await validateEmployee({
    companyId,
    employeeId,
  });

  const filter = {
    companyId,
    employeeId,
  };

  if (status) {
    filter.status = status;
  }

  return Expense.find(filter)
    .populate("categoryId", "name code requiresReceipt")
    .sort({
      expenseDate: -1,
      createdAt: -1,
    });
};

/*
|--------------------------------------------------------------------------
| Get Expense By ID
|--------------------------------------------------------------------------
*/

export const getExpenseById = async ({ companyId, employeeId, expenseId }) => {
  if (!mongoose.Types.ObjectId.isValid(expenseId)) {
    throw new ApiError(400, "Invalid expense ID");
  }

  const expense = await Expense.findOne({
    _id: expenseId,
    companyId,
    employeeId,
  })
    .populate("categoryId", "name code requiresReceipt")
    .populate("employeeId", "employeeCode name designation departmentId");

  if (!expense) {
    throw new ApiError(404, "Expense not found");
  }

  return expense;
};

/*
|--------------------------------------------------------------------------
| Update Draft Expense
|--------------------------------------------------------------------------
*/

export const updateExpense = async ({
  companyId,
  employeeId,
  userId,
  expenseId,
  data,
}) => {
  const expense = await Expense.findOne({
    _id: expenseId,
    companyId,
    employeeId,
  });

  if (!expense) {
    throw new ApiError(404, "Expense not found");
  }

  if (expense.status !== "DRAFT") {
    throw new ApiError(400, "Only draft expenses can be updated");
  }

  if (data.categoryId) {
    const category = await validateExpenseCategory({
      companyId,
      categoryId: data.categoryId,
    });

    const receipts = data.receipts ?? expense.receipts;

    if (category.requiresReceipt && (!receipts || receipts.length === 0)) {
      throw new ApiError(
        400,
        "A receipt is required for this expense category",
      );
    }
  }

  Object.assign(expense, data);

  expense.updatedBy = userId;

  await expense.save();

  return expense;
};
