"use server";

import { revalidatePath } from "next/cache";

import {
  createExpense,
  deletePendingExpense,
  getAuthenticatedProfileId,
  markExpensePaid,
  reviewExpense,
  updateExpense,
} from "./expense.service";

import {
  ExpenseInput,
  ReviewExpenseInput,
  UpdateExpenseInput,
} from "./expense.validation";

export async function createExpenseAction(
  values: ExpenseInput
) {
  const profileId = await getAuthenticatedProfileId();

  if (!profileId) {
    return {
      success: false,
      error: "Employee profile not found.",
    };
  }

  const result = await createExpense(profileId, values);

  if (result.success) {
    revalidatePath("/employee/expenses"); // employee pages refresh 
    revalidatePath("/expenses");// admin page refresh
  }

  return result;
}

export async function updateExpenseAction(
  expenseId: string,
  values: UpdateExpenseInput
) {
  const profileId = await getAuthenticatedProfileId();

  if (!profileId) {
    return {
      success: false,
      error: "Employee profile not found.",
    };
  }

  const result = await updateExpense(
    expenseId,
    profileId,
    values
  );

  if (result.success) {
    revalidatePath("/employee/expenses");
    revalidatePath("/expenses");
  }

  return result;
}



export async function reviewExpenseAction(
  values: ReviewExpenseInput
) {
  const reviewerId = await getAuthenticatedProfileId();

  if (!reviewerId) {
    return {
      success: false,
      error: "Admin profile not found.",
    };
  }

  const result = await reviewExpense(reviewerId, values);

  if (result.success) {
    revalidatePath("/expenses");
    revalidatePath("/employee/expenses");
  }

  return result;
}


export async function markExpensePaidAction(
  expenseId: string
) {
  const result = await markExpensePaid(expenseId);

  if (result.success) {
    revalidatePath("/expenses");
    revalidatePath("/employee/expenses");
  }

  return result;
}

export async function deleteExpenseAction(
  expenseId: string
) {
  const profileId = await getAuthenticatedProfileId();

  if (!profileId) {
    return {
      success: false,
      error: "Employee profile not found.",
    };
  }

  const result = await deletePendingExpense(
    profileId,
    expenseId
  );

  if (result.success) {
    revalidatePath("/employee/expenses");
    revalidatePath("/expenses");
  }

  return result;
}