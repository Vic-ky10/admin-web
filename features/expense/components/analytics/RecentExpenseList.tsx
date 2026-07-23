import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from "@/components/ui/Table";
import { ExpenseStatusBadge } from "../ExpenseStatusBadge";
import { Expense } from "../../expense.types";

export function RecentExpenseList({ recentExpenses }: { recentExpenses: Expense[] }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-lg font-bold text-slate-950">Recent Expenses</h2>
        <p className="text-xs text-slate-500 mt-1 mb-4">Your latest submitted claims</p>
      </div>

      {recentExpenses.length === 0 ? (
        <div className="text-center py-8 text-sm text-slate-500">No recent expenses found</div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Expense Title</TableHeader>
                <TableHeader>Category</TableHeader>
                <TableHeader>Amount</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader>Submitted Date</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {recentExpenses.map((exp) => (
                <TableRow key={exp.id}>
                  <TableCell>
                    <div className="font-medium text-slate-900 max-w-[250px] truncate" title={exp.description}>
                      {exp.description}
                    </div>
                  </TableCell>
                  <TableCell>{exp.expense_type}</TableCell>
                  <TableCell>
                    <span className="font-semibold text-slate-900 text-sm">
                      ₹{exp.amount.toLocaleString("en-IN")}
                    </span>
                  </TableCell>
                  <TableCell>
                    <ExpenseStatusBadge status={exp.status} />
                  </TableCell>
                  <TableCell>
                    {new Date(exp.expense_date).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
