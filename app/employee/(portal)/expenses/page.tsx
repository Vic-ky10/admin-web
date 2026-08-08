import { redirect } from "next/navigation";
import EmployeeExpenseClient from "@/features/expense/components/EmployeeExpenseClient";
import { getEmployeeExpenses } from "@/features/expense/expense.service";
import { ExpenseFilters } from "@/features/expense/expense.types";
import { expenseFiltersSchema } from "@/features/expense/expense.validation";
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
  const filters = expenseFiltersSchema.parse({
    search: params.search,
    status: params.status,
    paymentStatus: params.paymentStatus,
    expenseType: params.expenseType,
    date: params.date,
    hasReceipt: params.hasReceipt,
  }) as ExpenseFilters;

  const expenses = await getEmployeeExpenses(profile.id, filters);

  return (
    <div className="space-y-6 max-w-[1920px] mx-auto animate-fade-in">
      <PageHeader
        title="My Expenses"
        description="Submit expense reimbursement claims, track approvals, and review receipts."
        breadcrumbs={[
          { label: "Portal", href: "/employee/dashboard" },
          { label: "Expenses" },
        ]}
      />

      <EmployeeExpenseClient
        expenses={expenses}
        profile={profile}
        selectedStatus={filters.status}
        selectedExpenseType={filters.expenseType}
        selectedSearch={filters.search}
        selectedDate={filters.date}
        selectedHasReceipt={filters.hasReceipt}
      />
    </div>
  );
}
