import { redirect } from "next/navigation";
import EmployeeExpenseClient from "@/features/expense/components/EmployeeExpenseClient";
import { getEmployeeExpenses } from "@/features/expense/expense.service";
import {
  EXPENSE_STATUS,
  ExpenseFilters,
  PAYMENT_STATUS,
} from "@/features/expense/expense.types";
import { getCurrentEmployeeProfile } from "@/features/employee-portal/employee-portal.service";
import PageHeader from "@/components/layout/PageHeader";

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
    <div className="space-y-6 max-w-[1920px] mx-auto animate-fade-in">
      <PageHeader
        title="My Expenses"
        description="Submit expense reimbursement claims, track approvals, and review receipts."
        breadcrumbs={[{ label: "Portal", href: "/employee/dashboard" }, { label: "Expenses" }]}
      />

      <EmployeeExpenseClient
        expenses={expenses}
        selectedStatus={filters.status}
        selectedPaymentStatus={filters.paymentStatus}
      />
    </div>
  );
}
