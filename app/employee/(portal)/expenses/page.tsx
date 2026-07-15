import { redirect } from "next/navigation";

import EmployeeExpenseClient from "@/features/expense/components/EmployeeExpenseClient";
import { getEmployeeExpenses } from "@/features/expense/expense.service";
import {
  EXPENSE_STATUS,
  ExpenseFilters,
  PAYMENT_STATUS,
} from "@/features/expense/expense.types";
import { getCurrentEmployeeProfile } from "@/features/employee-portal/employee-portal.service";

export const dynamic = "force-dynamic";

interface EmployeeExpensesPageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function EmployeeExpensesPage({
  searchParams,
}: EmployeeExpensesPageProps) {
  const profile = await getCurrentEmployeeProfile();

  if (!profile) {
    redirect("/employee/login");
  }

  const params = await searchParams;
  const status = Object.values(EXPENSE_STATUS).find(
    (value) => value === params.status
  );
  const paymentStatus = Object.values(PAYMENT_STATUS).find(
    (value) => value === params.paymentStatus
  );
  const filters: ExpenseFilters = {
    status,
    paymentStatus,
  };
  const expenses = await getEmployeeExpenses(profile.id, filters);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Expenses</h1>
        <p className="text-slate-500">
          Submit expenses, track approvals, and manage pending requests.
        </p>
      </div>

      <EmployeeExpenseClient
        expenses={expenses}
        selectedStatus={filters.status}
        selectedPaymentStatus={filters.paymentStatus}
      />
    </div>
  );
}
