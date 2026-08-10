import { adminClient } from "@/lib/supabase/admin";
import { ActionResponse } from "@/types/action";
import { getCurrentEmployeeProfile } from "@/features/employee-portal/employee-portal.service";
import {
  createNotification,
  notifyAdmins,
} from "@/features/notification/notification.helper";
import { Employee } from "@/features/employee/employee.types";
import {
  EXPENSE_STATUS,
  PAYMENT_STATUS,
  EXPENSE_CATEGORY,
  Expense,
  ExpenseFilters,
  ExpenseWithEmployee,
  EmployeeExpenseSummary,
  AdminExpenseSummary,
  ExpenseCashOut,
} from "./expense.types";

import {
  ExpenseInput,
  UpdateExpenseInput,
  ReviewExpenseInput,
} from "./expense.validation";




const EXPENSE_SELECT = `
id,
profile_id,
expense_code,
expense_type,
amount,
approved_amount,
currency,
description,
receipt_url,
expense_date,
status,
payment_status,
reviewed_by,
reviewed_at,
review_comment,
created_at,
updated_at
`;

const EXPENSE_WITH_EMPLOYEE_SELECT = `
id,
profile_id,
expense_code,
expense_type,
amount,
approved_amount,
currency,
description,
receipt_url,
expense_date,
status,
payment_status,
review_comment,
reviewed_by,
reviewed_at,
created_at,
updated_at,
employee:profiles!expenses_profile_id_fkey(
employee_id,
full_name,
email,
department,
designation
)
`;

// export async function generateExpenseCode(): Promise<string> {
//   const { data, error } = await adminClient
//     .from("expenses")
//     .select("expense_code")
//     .like("expense_code", `${EXPENSE_CODE_PREFIX}%`)
//     .order("created_at", {
//       ascending: false,
//     })
//     .limit(1)
//     .maybeSingle();

//   if (error) {
//     throw new Error("Unable to generate expense code.");
//   }

//   if (!data?.expense_code) {
//     return formatExpenseCode(1);
//   }

//   const current = Number(data.expense_code.replace(EXPENSE_CODE_PREFIX, ""));

//   if (Number.isNaN(current)) {
//     throw new Error("Latest expense code is invalid.");
//   }

//   return formatExpenseCode(current + 1);
// }

export async function createExpense(
  profileId: string,
  values: ExpenseInput,
): Promise<ActionResponse<Expense>> {
  // let expenseCode: string;

  // try {
  //   // expenseCode = await generateExpenseCode();
  // } catch (error) {
  //   return {
  //     success: false,
  //     error:
  //       error instanceof Error
  //         ? error.message
  //         : "Unable to generate expense code.",
  //   };
  // }

  const { data, error } = await adminClient
    .from("expenses")
    .insert({
      profile_id: profileId,

      // expense_code: expenseCode,

      expense_type: values.expense_type,

      amount: values.amount,

      currency: "INR",

      description: values.description,

      receipt_url: values.receipt_url ?? null,

      expense_date: values.expense_date,

      status: EXPENSE_STATUS.PENDING,

      payment_status: PAYMENT_STATUS.PENDING,

      approved_amount: null,

      reviewed_by: null,

      reviewed_at: null,

      review_comment: null,
    })
    .select(EXPENSE_SELECT)
    .single();

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }
  await notifyAdmins({
    title: "New Expense Submitted",
    message: "...",
    notificationType: "Expense",
    referenceId: data.id,
    actionUrl: "/expenses",
    createdBy: profileId,
  });
  return {
    success: true,
    message: "Expense submitted successfully.",
    data: data as Expense,
  };
}    
export async function updateExpense(
  expenseId: string,
  profileId: string,
  values: UpdateExpenseInput,
): Promise<ActionResponse<Expense>> {
  const { data: existingExpense, error: fetchError } = await adminClient
    .from("expenses")
    .select("id, profile_id, status")
    .eq("id", expenseId)
    .single();

  if (fetchError) {
    return {
      success: false,
      error: fetchError.message,
    };
  }

  if (!existingExpense) {
    return {
      success: false,
      error: "Expense not found.",
    };
  }

  if (existingExpense.profile_id !== profileId) {
    return {
      success: false,
      error: "You are not allowed to update this expense.",
    };
  }

  if (existingExpense.status !== EXPENSE_STATUS.PENDING) {
    return {
      success: false,
      error: "Only pending expenses can be updated.",
    };
  }

  const { data, error } = await adminClient
    .from("expenses")
    .update({
      expense_type: values.expense_type,
      amount: values.amount,
      description: values.description,
      receipt_url: values.receipt_url ?? null,
      expense_date: values.expense_date,
    })
    .eq("id", expenseId)
    .select(EXPENSE_SELECT)
    .single();

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
    message: "Expense updated successfully.",
    data: data as Expense,
  };
}

// export async function reviewExpense(
//   reviewerId: string,
//   values: ReviewExpenseInput
// ): Promise<ActionResponse<Expense>> {
//   const existing = await getExpenseById(values.expenseId);

//   if (!existing) {
//     return {
//       success: false,
//       error: "Expense not found.",
//     };
//   }

//   if (existing.status !== EXPENSE_STATUS.PENDING) {
//     return {
//       success: false,
//       error: "Only pending expenses can be reviewed.",
//     };
//   }

//   const { data, error } = await adminClient
//     .from("expenses")
//     .update({
//       status: values.status,
//       approved_amount: values.approved_amount,
//       review_comment: values.review_comment || null,
//       reviewed_by: reviewerId,
//       reviewed_at: new Date().toISOString(),
//     })
//     .eq("id", values.expenseId)
//     .eq("status", EXPENSE_STATUS.PENDING)
//     .select(EXPENSE_SELECT)
//     .single();

//   if (error) {
//     return {
//       success: false,
//       error: error.message,
//     };
//   }

//   await createNotification({
//     profileId: existing.profile_id,
//     title: "Expense Request Updated",
//     message: `Your expense request has been ${values.status.toLowerCase()}.`,
//     notificationType: "expense",
//     referenceId: existing.id,
//     actionUrl: "/employee/expenses",
//     createdBy: reviewerId,
//   });

//   return {
//     success: true,
//     message: `Expense ${values.status.toLowerCase()} successfully.`,
//     data: data as Expense,
//   };
// }

export async function getEmployeeExpenses(
  profileId: string,
  filters: ExpenseFilters = {},
): Promise<Expense[]> {
  let query = adminClient
    .from("expenses")
    .select(EXPENSE_SELECT)
    .eq("profile_id", profileId) //Returns only the logged-in employee's expenses.
    .order("created_at", { ascending: false }); //Returns only the logged-in employee's expenses.

  if (filters.status) {
    query = query.eq("status", filters.status);
  }

  if (filters.paymentStatus) {
    query = query.eq("payment_status", filters.paymentStatus);
  }

  if (filters.expenseType) {
    query = query.eq("expense_type", filters.expenseType);
  }

  if (filters.date) {
    query = query.eq("expense_date", filters.date);
  }

  if (filters.hasReceipt) {
    if (filters.hasReceipt === "true") {
      query = query.not("receipt_url", "is", null);
    } else if (filters.hasReceipt === "false") {
      query = query.is("receipt_url", null);
    }
  }

  if (filters.search) {
    const searchVal = `%${filters.search}%`;
    query = query.or(`expense_code.ilike.${searchVal},description.ilike.${searchVal}`);
  }

  const { data, error } = await query;

  if (error) {
    console.error(error);
    return [];
  }

  return data as Expense[];
}

export async function getExpenses(
  filters: ExpenseFilters = {},
): Promise<ExpenseWithEmployee[]> {
  let query = adminClient
    .from("expenses")
    .select(EXPENSE_WITH_EMPLOYEE_SELECT)
    .order("created_at", { ascending: false });

  if (filters.profileId) {
    query = query.eq("profile_id", filters.profileId);
  }

  if (filters.status) {
    query = query.eq("status", filters.status);
  }

  if (filters.paymentStatus) {
    query = query.eq("payment_status", filters.paymentStatus);
  }

  if (filters.expenseType) {
    query = query.eq("expense_type", filters.expenseType);
  }

  if (filters.date) {
    query = query.eq("expense_date", filters.date);
  }

  if (filters.hasReceipt) {
    if (filters.hasReceipt === "true") {
      query = query.not("receipt_url", "is", null);
    } else if (filters.hasReceipt === "false") {
      query = query.is("receipt_url", null);
    }
  }

  const { data, error } = await query;

  if (error) {
    throw error;
    return [];
  }

  const records = (data as unknown as SupabaseExpenseRecord[]).map((record) => ({
    ...record,
    employee: Array.isArray(record.employee)
      ? (record.employee[0] ?? null)
      : record.employee,
  }));

  const search = filters.search?.toLowerCase();
  if (!search) {
    return records;
  }

  return records.filter((record) => {
    const employee = record.employee;
    return (
      record.expense_code.toLowerCase().includes(search) ||
      record.description.toLowerCase().includes(search) ||
      employee?.employee_id.toLowerCase().includes(search) ||
      employee?.full_name.toLowerCase().includes(search) ||
      employee?.email.toLowerCase().includes(search)
    );
  });
}

async function getExpenseById(id: string) {
  const { data, error } = await adminClient
    .from("expenses")
    .select(EXPENSE_SELECT)
    .eq("id", id) // search using primary Key(id)
    .maybeSingle(); // return only one record

  if (error) {
    console.error(error);
    return null;
  }

  return data as Expense | null;
}

export async function deletePendingExpense(
  profileId: string,
  expenseId: string,
): Promise<ActionResponse<Expense>> {
  const existing = await getExpenseById(expenseId);

  if (!existing || existing.profile_id !== profileId) {
    return {
      success: false,
      error: "Expense was not found.",
    };
  }

  if (existing.status !== EXPENSE_STATUS.PENDING) {
    return {
      success: false,
      error: "Only pending expenses can be deleted.",
    };
  }

  const { data, error } = await adminClient
    .from("expenses")
    .delete()
    .eq("id", expenseId)
    .eq("profile_id", profileId)
    .eq("status", EXPENSE_STATUS.PENDING)
    .select(EXPENSE_SELECT)
    .single();

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
    message: "Expense deleted successfully.",
    data: data as Expense,
  };
}

export async function reviewExpense(
  reviewerId: string,
  values: ReviewExpenseInput,
): Promise<ActionResponse<Expense>> {
  const existing = await getExpenseById(values.expenseId);

  if (!existing) {
    return {
      success: false,
      error: "Expense was not found.",
    };
  }

  if (existing.status !== EXPENSE_STATUS.PENDING) {
    return {
      success: false,
      error: "Only pending expenses can be reviewed.",
    };
  }

  const { data, error } = await adminClient
    .from("expenses")
    .update({
      status: values.status,
      approved_amount: values.approved_amount,
      reviewed_by: reviewerId,
      reviewed_at: new Date().toISOString(),
      review_comment: values.review_comment || null,
    })
    .eq("id", values.expenseId)
    .eq("status", EXPENSE_STATUS.PENDING)
    .select(EXPENSE_SELECT)
    .single();

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  await createNotification({
    profileId: existing.profile_id,
    title: "Expense Request Updated",
    message: `Your expense request has been ${values.status.toLowerCase()}.`,
    notificationType: "Expense",
    referenceId: existing.id,
    actionUrl: "/employee/expenses",
    createdBy: reviewerId,
  });
  return {
    success: true,
    message: `Expense ${values.status.toLowerCase()} successfully.`,
    data: data as Expense,
  };
}

type SupabaseExpenseRecord = ExpenseWithEmployee & {
  employee:
    | ExpenseWithEmployee["employee"]
    | NonNullable<ExpenseWithEmployee["employee"]>[];
};

export async function markExpensePaid(
  expenseId: string,
): Promise<ActionResponse<Expense>> {
  const existing = await getExpenseById(expenseId);

  if (!existing) {
    return {
      success: false,
      error: "Expense was not found.",
    };
  }

  if (existing.status !== EXPENSE_STATUS.APPROVED) {
    // only approved expenses can become Paid.
    return {
      success: false,
      error: "Only approved expenses can be marked as paid.",
    };
  }

  const { data, error } = await adminClient
    .from("expenses")
    .update({
      payment_status: PAYMENT_STATUS.PAID,
    })
    .eq("id", expenseId)
    .eq("status", EXPENSE_STATUS.APPROVED)
    .select(EXPENSE_SELECT)
    .single();

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
    message: "Expense marked as paid.",
    data: data as Expense,
  };
}

export async function getAuthenticatedProfileId() {
  const profile = await getCurrentEmployeeProfile();
  return profile?.id ?? null;
}

export async function getEmployeeExpenseSummary(
  profileId: string,
  currentUser: Employee | null = null,
): Promise<EmployeeExpenseSummary> {
  const user = currentUser ?? (await getCurrentEmployeeProfile());

  if (!user) {
    throw new Error("Unauthorized: Profile not found.");
  }

  if (user.role !== "Admin" && user.id !== profileId) {
    throw new Error(
      "Unauthorized: Employees can only view their own expense analytics.",
    );
  }

  const expenses = await getEmployeeExpenses(profileId);

  let totalExpenses = 0;
  let approvedAmount = 0;
  let pendingAmount = 0;
  let rejectedAmount = 0;
  let approvedCount = 0;
  let pendingCount = 0;
  let rejectedCount = 0;
  let monthlyTotal = 0;

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const categoryMap: Record<
    string,
    { category: string; amount: number; count: number }
  > = {};
  Object.values(EXPENSE_CATEGORY).forEach((cat) => {
    categoryMap[cat] = { category: cat, amount: 0, count: 0 };
  });

  const monthlyMap: Record<
    string,
    { month: string; amount: number; count: number }
  > = {};

  expenses.forEach((expense) => {
    totalExpenses += expense.amount;

    if (expense.status === EXPENSE_STATUS.APPROVED) {
      approvedAmount += expense.approved_amount ?? expense.amount;
      approvedCount += 1;
    } else if (expense.status === EXPENSE_STATUS.PENDING) {
      pendingAmount += expense.amount;
      pendingCount += 1;
    } else if (expense.status === EXPENSE_STATUS.REJECTED) {
      rejectedAmount += expense.amount;
      rejectedCount += 1;
    }

    const expDate = new Date(expense.expense_date);
    if (
      expDate.getFullYear() === currentYear &&
      expDate.getMonth() === currentMonth
    ) {
      monthlyTotal += expense.amount;
    }

    // Monthly aggregation (YYYY-MM)
    if (expense.expense_date) {
      const monthKey = expense.expense_date.substring(0, 7); // e.g. "2026-07"
      if (monthKey && monthKey.length === 7) {
        if (!monthlyMap[monthKey]) {
          monthlyMap[monthKey] = {
            month: monthKey,
            amount: 0,
            count: 0,
          };
        }
        monthlyMap[monthKey].amount += expense.amount;
        monthlyMap[monthKey].count += 1;
      }
    }

    const cat = expense.expense_type;
    if (!categoryMap[cat]) {
      categoryMap[cat] = { category: cat, amount: 0, count: 0 };
    }
    categoryMap[cat].amount += expense.amount;
    categoryMap[cat].count += 1;
  });

  const totalExpenseCount = expenses.length;
  const averageExpense =
    totalExpenseCount > 0 ? totalExpenses / totalExpenseCount : 0;
  const categorySummary = Object.values(categoryMap);
  const monthlySummary = Object.values(monthlyMap).sort((a, b) =>
    a.month.localeCompare(b.month),
  );
  const recentExpenses = expenses.slice(0, 5);

  const cashOuts = await getEmployeeCashOuts(profileId);
  const totalPersonalSpend = cashOuts.reduce((sum, c) => sum + c.amount, 0);
  const walletBalance = approvedAmount - totalPersonalSpend;

  return {
    totalExpenses,
    approvedAmount,
    pendingAmount,
    rejectedAmount,
    totalExpenseCount,
    approvedCount,
    pendingCount,
    rejectedCount,
    monthlyTotal,
    averageExpense,
    walletBalance,
    categorySummary,
    monthlySummary,
    recentExpenses,
  };
}

export async function getAdminExpenseSummary(
  currentUser: Employee | null = null,
): Promise<AdminExpenseSummary> {
  const user = currentUser ?? (await getCurrentEmployeeProfile());

  if (!user) {
    throw new Error("Unauthorized: Profile not found.");
  }

  if (user.role !== "Admin") {
    throw new Error("Unauthorized: Admin access required.");
  }

  const expenses = await getExpenses();

  let totalCompanyExpense = 0;
  let approvedAmount = 0;
  let pendingAmount = 0;
  let rejectedAmount = 0;

  const uniqueProfiles = new Set<string>();
  const topEmployeesMap: Record<
    string,
    {
      profileId: string;
      name: string;
      email: string;
      totalAmount: number;
      count: number;
    }
  > = {};
  const deptMap: Record<
    string,
    { department: string; totalAmount: number; count: number }
  > = {};
  const monthlyMap: Record<
    string,
    { month: string; amount: number; count: number }
  > = {};

  expenses.forEach((expense) => {
    totalCompanyExpense += expense.amount;
    uniqueProfiles.add(expense.profile_id);

    if (expense.status === EXPENSE_STATUS.APPROVED) {
      approvedAmount += expense.approved_amount ?? expense.amount;
    } else if (expense.status === EXPENSE_STATUS.PENDING) {
      pendingAmount += expense.amount;
    } else if (expense.status === EXPENSE_STATUS.REJECTED) {
      rejectedAmount += expense.amount;
    }

    // Top employees aggregation
    const pId = expense.profile_id;
    if (!topEmployeesMap[pId]) {
      topEmployeesMap[pId] = {
        profileId: pId,
        name: expense.employee?.full_name ?? "Unknown",
        email: expense.employee?.email ?? "",
        totalAmount: 0,
        count: 0,
      };
    }
    topEmployeesMap[pId].totalAmount += expense.amount;
    topEmployeesMap[pId].count += 1;

    const dept = expense.employee?.department || "Other";
    if (!deptMap[dept]) {
      deptMap[dept] = {
        department: dept,
        totalAmount: 0,
        count: 0,
      };
    }
    deptMap[dept].totalAmount += expense.amount;
    deptMap[dept].count += 1;

    if (expense.expense_date) {
      const monthKey = expense.expense_date.substring(0, 7); // e.g. "2026-07"
      if (monthKey && monthKey.length === 7) {
        if (!monthlyMap[monthKey]) {
          monthlyMap[monthKey] = {
            month: monthKey,
            amount: 0,
            count: 0,
          };
        }
        monthlyMap[monthKey].amount += expense.amount;
        monthlyMap[monthKey].count += 1;
      }
    }
  });

  const totalExpenseCount = expenses.length;
  const employeeCount = uniqueProfiles.size;
  const averageExpense =
    totalExpenseCount > 0 ? totalCompanyExpense / totalExpenseCount : 0;

  const topEmployees = Object.values(topEmployeesMap)
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .slice(0, 5);

  const departmentSummary = Object.values(deptMap);

  const monthlySummary = Object.values(monthlyMap).sort((a, b) =>
    a.month.localeCompare(b.month),
  );

  const recentExpenses = expenses.slice(0, 5);

  return {
    totalCompanyExpense,
    approvedAmount,
    pendingAmount,
    rejectedAmount,
    totalExpenseCount,
    employeeCount,
    averageExpense,
    topEmployees,
    departmentSummary,
    monthlySummary,
    recentExpenses,
  };
}

// async function getExpenseById(id: string) {
//   const { data, error } = await adminClient
//     .from("expenses")
//     .select(EXPENSE_SELECT)
//     .eq("id", id)
//     .maybeSingle();

//   if (error) {
//     console.error(error);
//     return null;
//   }

//   return data as Expense | null;
// }
// async function notifyAdmins({
//   title,
//   message,
//   referenceId,
//   actionUrl,
//   createdBy,
// }: {
//   title: string;
//   message: string;
//   referenceId?: string;
//   actionUrl?: string;
//   createdBy?: string;
// }) {
//   const { data, error } = await adminClient
//     .from("profiles")
//     .select("id")
//     .eq("role", "Admin");

//   if (error) {
//     console.error(error);
//     return;
//   }

//   await Promise.all(
//     (data ?? []).map((admin) =>
//       createNotification({
//         profileId: admin.id,
//         title,
//         message,
//         notificationType: "expense",
//         referenceId,
//         actionUrl,
//         createdBy,
//       })
//     )
//   );
// }
// async function createNotification({
//   profileId,
//   title,
//   message,
//   notificationType,
//   referenceId,
//   actionUrl,
//   createdBy,
// }: {
//   profileId: string;
//   title: string;
//   message: string;
//   notificationType: string;
//   referenceId?: string;
//   actionUrl?: string;
//   createdBy?: string;
// }) {
//   const { error } = await adminClient
//     .from("notifications")
//     .insert({
//   profile_id: profileId,
//   title,
//   message,
//   notification_type: notificationType,
//   reference_id: referenceId ?? null,
//   action_url: actionUrl ?? null,
//   is_read: false,
//   created_by: createdBy ?? null,
// });

//   if (error) {
//     console.error(error);
//   }
// }

// function isSchemaMismatch(message: string) {
//   return (
//     message.includes("column") ||
//     message.includes("schema cache") ||
//     message.includes("Could not find")
//   );
// }

// ExpenseCashOut interface is defined in expense.types.ts and imported above
export type { ExpenseCashOut };

export async function getEmployeeCashOuts(profileId: string): Promise<ExpenseCashOut[]> {
  const { data, error } = await adminClient
    .from("expense_cash_outs")
    .select("*")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching employee cash outs:", error);
    return [];
  }
  return data as ExpenseCashOut[];
}

export async function getAllCashOuts(): Promise<ExpenseCashOut[]> {
  const { data, error } = await adminClient
    .from("expense_cash_outs")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching all cash outs:", error);
    return [];
  }
  return data as ExpenseCashOut[];
}

export async function createCashOut(
  profileId: string,
  amount: number,
  description?: string
): Promise<ActionResponse<ExpenseCashOut>> {
  const summary = await getEmployeeExpenseSummary(profileId);
  if (typeof summary.walletBalance === 'number' && amount > summary.walletBalance) {
    return {
      success: false,
      error: `Cash out amount (₹${amount}) cannot exceed available balance (₹${summary.walletBalance}).`,
    };
  }

  const { data, error } = await adminClient
    .from("expense_cash_outs")
    .insert({
      profile_id: profileId,
      amount,
      description: description || null,
    })
    .select("*")
    .single();

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
    message: "Cash out recorded successfully.",
    data: data as ExpenseCashOut,
  };
}
