import ExpenseTable from "@/features/expense/components/ExpenseTable";
import { getExpenses } from "@/features/expense/expense.service";
import PageHeader from "@/components/layout/PageHeader";

export default async function ExpensesPage() {
  const expenses = await getExpenses();

  return (
    <div className="space-y-6 max-w-[1920px] mx-auto animate-fade-in">
      <PageHeader
        title="Expense Claims"
        description="Validate reimbursement claims, review receipts, and mark payments."
        breadcrumbs={[{ label: "Admin", href: "/dashboard" }, { label: "Expenses" }]}
      />

      <ExpenseTable expenses={expenses} />
    </div>
  );
}