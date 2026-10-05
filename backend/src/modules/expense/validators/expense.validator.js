import Joi from "joi";

/*
|--------------------------------------------------------------------------
| Expense Category
|--------------------------------------------------------------------------
*/

export const createExpenseCategoryValidator = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),

  code: Joi.string()
    .trim()
    .uppercase()
    .pattern(/^[A-Z0-9_-]+$/)
    .max(50)
    .required(),

  description: Joi.string().trim().max(500).allow("").default(""),

  requiresReceipt: Joi.boolean().default(true),

  isActive: Joi.boolean().default(true),
});

export const updateExpenseCategoryValidator = Joi.object({
  name: Joi.string().trim().min(2).max(100),

  code: Joi.string()
    .trim()
    .uppercase()
    .pattern(/^[A-Z0-9_-]+$/)
    .max(50),

  description: Joi.string().trim().max(500).allow(""),

  requiresReceipt: Joi.boolean(),

  isActive: Joi.boolean(),
}).min(1);

/*
|--------------------------------------------------------------------------
| Create Expense
|--------------------------------------------------------------------------
*/

export const createExpenseValidator = Joi.object({
  categoryId: Joi.string().hex().length(24).required(),

  expenseDate: Joi.date().iso().required(),

  amount: Joi.number().positive().precision(2).required(),

  currency: Joi.string().trim().uppercase().length(3).default("INR"),

  title: Joi.string().trim().min(2).max(200).required(),

  description: Joi.string().trim().max(2000).allow("").default(""),

  receipts: Joi.array()
    .items(
      Joi.object({
        url: Joi.string().uri().required(),

        fileName: Joi.string().trim().max(255).allow("").default(""),

        fileType: Joi.string().trim().max(100).allow("").default(""),

        fileSize: Joi.number().integer().min(0).default(0),
      }),
    )
    .default([]),
});

/*
|--------------------------------------------------------------------------
| Update Draft Expense
|--------------------------------------------------------------------------
*/

export const updateExpenseValidator = Joi.object({
  categoryId: Joi.string().hex().length(24),

  expenseDate: Joi.date().iso(),

  amount: Joi.number().positive().precision(2),

  currency: Joi.string().trim().uppercase().length(3),

  title: Joi.string().trim().min(2).max(200),

  description: Joi.string().trim().max(2000).allow(""),

  receipts: Joi.array().items(
    Joi.object({
      url: Joi.string().uri().required(),

      fileName: Joi.string().trim().max(255).allow(""),

      fileType: Joi.string().trim().max(100).allow(""),

      fileSize: Joi.number().integer().min(0),
    }),
  ),
}).min(1);

/*
|--------------------------------------------------------------------------
| Expense Decision
|--------------------------------------------------------------------------
*/

export const expenseDecisionValidator = Joi.object({
  remarks: Joi.string().trim().max(2000).allow("").default(""),
});

/*
|--------------------------------------------------------------------------
| Reimbursement
|--------------------------------------------------------------------------
*/

export const reimbursementValidator = Joi.object({
  referenceNumber: Joi.string().trim().max(100).required(),

  remarks: Joi.string().trim().max(2000).allow("").default(""),
});
