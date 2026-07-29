import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeader,
  TableCell,
} from "@/components/ui/Table";
import { TopEmployeeSummary, ExpenseWithEmployee } from "../../expense.types";

interface TopEmployeesTableProps {
  topEmployees: TopEmployeeSummary[];
  expenses: ExpenseWithEmployee[];
}

export function TopEmployeesTable({
  topEmployees,
  expenses,
}: TopEmployeesTableProps) {
  const getDept = (profileId: string) => {
    const exp = expenses.find((e) => e.profile_id === profileId);
    return exp?.employee?.department || "Other";
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <h2 className="text-lg font-semibold tracking-tight text-slate-950 sm:text-xl">
        Top Spending Employees
      </h2>
    <p className="mb-4 mt-1 text-xs text-slate-500 sm:text-sm">
        Employees with the highest expense claims
      </p>

      {topEmployees.length === 0 ? (
        <div className="text-center py-6 text-sm text-slate-500">
          No data available
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table className="min-w-[700px]">
            <TableHead>
              <TableRow>
                <TableHeader>Employee</TableHeader>
                <TableHeader>Department</TableHeader>
                <TableHeader>Claims Count</TableHeader>
                <TableHeader>Total Amount</TableHeader>
              </TableRow>
            </TableHead>

            <TableBody>
              {topEmployees.map((emp) => (
                <TableRow key={emp.profileId}>
                  <TableCell>
                    <div>
                      <p className="font-semibold text-slate-900">{emp.name}</p>
                      <p className="text-xs text-slate-400">{emp.email}</p>
                    </div>
                  </TableCell>

                  <TableCell>{getDept(emp.profileId)}</TableCell>

                  <TableCell>{emp.count}</TableCell>

                  <TableCell>
                    <span className="font-semibold text-slate-900 text-sm">
                      ₹{emp.totalAmount.toLocaleString("en-IN")}
                    </span>
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
