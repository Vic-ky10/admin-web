import ExpenseTable from "@/features/expense/components/ExpenseTable";
import { getExpenses } from "@/features/expense/expense.service";
import { ExpenseFilters } from "@/features/expense/expense.types";
import { expenseFiltersSchema } from "@/features/expense/expense.validation";
import PageHeader from "@/components/layout/PageHeader";

export const dynamic = "force-dynamic";

interface ExpensesPageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function ExpensesPage({
  searchParams,
}: ExpensesPageProps) {
  const params = await searchParams;
  const filters = expenseFiltersSchema.parse({
    search: params.search,
    status: params.status,
    paymentStatus: params.paymentStatus,
    expenseType: params.expenseType,
    date: params.date,
  }) as ExpenseFilters;

  const expenses = await getExpenses(filters);

  return (
    <div className="space-y-6 max-w-[1920px] mx-auto animate-fade-in">
      <PageHeader
        title="Expense Claims"
        description="Validate reimbursement claims, review receipts, and mark payments."
        breadcrumbs={[{ label: "Admin", href: "/dashboard" }, { label: "Expenses" }]}
      />

      <ExpenseTable
        expenses={expenses}
        selectedSearch={filters.search}
        selectedStatus={filters.status}
        selectedExpenseType={filters.expenseType}
        selectedDate={filters.date}
      />
    </div>
  );
}