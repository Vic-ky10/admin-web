import { z } from "zod";
import { EXPENSE_CATEGORY, EXPENSE_STATUS, PAYMENT_STATUS } from "./expense.types";

const expenseCategoryValues = Object.values(EXPENSE_CATEGORY) as [
  string,
  ...string[]
];

const statusValues = Object.values(EXPENSE_STATUS) as [
  string,
  ...string[]
];

const paymentStatusValues = Object.values(PAYMENT_STATUS) as [
  string,
  ...string[]
];

export const expenseFiltersSchema = z.object({
  search: z.string().trim().optional(),
  status: z.enum(statusValues).or(z.literal("")).optional(),
  paymentStatus: z.enum(paymentStatusValues).or(z.literal("")).optional(),
  expenseType: z.string().trim().optional(),
  date: z.string().trim().optional(),
  profileId: z.string().trim().optional(),
  hasReceipt: z.string().trim().optional(),
});

export type ExpenseFiltersInput = z.infer<typeof expenseFiltersSchema>;

export const expenseSchema = z.object({
  expense_type: z.enum(expenseCategoryValues),

  amount: z
    .number({
      error: "Amount is required.",
    })
    .positive("Amount must be greater than 0."),

  description: z
    .string()
    .trim()
    .min(5, "Description is required.")
    .max(500, "Description cannot exceed 500 characters."),

  expense_date: z.string().min(1, "Expense date is required."),

  receipt_url: z.string().nullable().optional(),
  receipt_name: z.string().nullable().optional(),
  receipt_size: z.number().nullable().optional(),
  receipt_type: z.string().nullable().optional(),
  uploaded_at: z.string().nullable().optional(),
});

export const reviewExpenseSchema = z.object({
  expenseId: z.string().uuid(),

  status: z.enum([
    EXPENSE_STATUS.APPROVED,
    EXPENSE_STATUS.REJECTED,
  ]),

 approved_amount: z.coerce
  .number({
    error: "Approved amount is required.",
  })
  .min(0, "Approved amount cannot be negative."),

  review_comment: z
    .string()
    .trim()
    .max(500, "Comment cannot exceed 500 characters.")
    .optional()
.or(z.literal(""))
});

export type ExpenseInput = z.infer<typeof expenseSchema>;
export type ReviewExpenseInput =
  z.infer<typeof reviewExpenseSchema>;


 export const UpdateExpenseSchema = expenseSchema.partial();

export type UpdateExpenseInput = z.infer<typeof UpdateExpenseSchema>;
