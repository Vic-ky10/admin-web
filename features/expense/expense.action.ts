"use server";

import { revalidatePath } from "next/cache";

import {
  createExpense,
  deletePendingExpense,
  getAuthenticatedProfileId,
  markExpensePaid,
  reviewExpense,
  updateExpense,
  getEmployeeExpenseSummary,
  getAdminExpenseSummary,
  getEmployeeExpenses,
  getExpenses,
  createCashOut,
  getEmployeeCashOuts,
  getAllCashOuts,
} from "./expense.service";

import { ActionResponse } from "@/types/action";
import { EmployeeExpenseSummary, AdminExpenseSummary, Expense, ExpenseWithEmployee } from "./expense.types";

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

export async function getEmployeeExpenseSummaryAction(): Promise<ActionResponse<EmployeeExpenseSummary>> {
  try {
    const profileId = await getAuthenticatedProfileId();
    if (!profileId) {
      return {
        success: false,
        error: "Employee profile not found.",
      };
    }
    const data = await getEmployeeExpenseSummary(profileId);
    return {
      success: true,
      data,
    };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to fetch employee expense summary.",
    };
  }
}

export async function getAdminExpenseSummaryAction(): Promise<ActionResponse<AdminExpenseSummary>> {
  try {
    const data = await getAdminExpenseSummary();
    return {
      success: true,
      data,
    };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to fetch admin expense summary.",
    };
  }
}

export async function getEmployeeExpensesUnfilteredAction(): Promise<ActionResponse<Expense[]>> {
  try {
    const profileId = await getAuthenticatedProfileId();
    if (!profileId) {
      return {
        success: false,
        error: "Employee profile not found.",
      };
    }
    const data = await getEmployeeExpenses(profileId);
    return {
      success: true,
      data,
    };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to fetch unfiltered employee expenses.",
    };
  }
}

export async function getAdminExpensesUnfilteredAction(): Promise<ActionResponse<ExpenseWithEmployee[]>> {
  try {
    const data = await getExpenses();
    return {
      success: true,
      data,
    };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to fetch unfiltered admin expenses.",
    };
  }
}

export async function createCashOutAction(amount: number, description?: string) {
  const profileId = await getAuthenticatedProfileId();
  if (!profileId) {
    return {
      success: false,
      error: "Employee profile not found.",
    };
  }

  const result = await createCashOut(profileId, amount, description);
  if (result.success) {
    revalidatePath("/employee/expenses");
    revalidatePath("/expenses");
  }
  return result;
}

export async function getEmployeeCashOutsAction() {
  const profileId = await getAuthenticatedProfileId();
  if (!profileId) {
    return [];
  }
  return getEmployeeCashOuts(profileId);
}

export async function getAllCashOutsAction() {
  return getAllCashOuts();
}