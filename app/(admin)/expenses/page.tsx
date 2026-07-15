import ExpenseTable from "@/features/expense/components/ExpenseTable";
import { getExpenses } from "@/features/expense/expense.service";


export default async function ExpensesPage() {
  const expenses = await getExpenses();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Expenses</h1>
        <p className="text-slate-500">
          Review employee expense requests and manage reimbursements.
        </p>
      </div>

      <ExpenseTable expenses={expenses} />
    </div>
  );
}