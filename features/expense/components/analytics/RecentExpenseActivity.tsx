import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from "@/components/ui/Table";
import { ExpenseStatusBadge } from "../ExpenseStatusBadge";
import { ExpenseWithEmployee } from "../../expense.types";

export function RecentExpenseActivity({ recentExpenses }: { recentExpenses: ExpenseWithEmployee[] }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-slate-950">Recent Expense Activity</h2>
      <p className="text-xs text-slate-500 mt-1 mb-4">Latest employee expense submissions</p>

      {recentExpenses.length === 0 ? (
        <div className="text-center py-6 text-sm text-slate-500">No recent activity found</div>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Employee</TableHeader>
              <TableHeader>Description</TableHeader>
              <TableHeader>Category</TableHeader>
              <TableHeader>Amount</TableHeader>
              <TableHeader>Status</TableHeader>
              <TableHeader>Date</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {recentExpenses.map((exp) => (
              <TableRow key={exp.id}>
                <TableCell>
                  <div>
                    <p className="font-semibold text-slate-900">{exp.employee?.full_name ?? "Unknown"}</p>
                    <p className="text-xs text-slate-400">{exp.employee?.email ?? ""}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="max-w-[200px] truncate" title={exp.description}>
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
      )}
    </div>
  );
}
