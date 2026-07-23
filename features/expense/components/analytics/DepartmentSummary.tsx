import { Briefcase } from "lucide-react";
import { DepartmentSummary as DeptSummaryType } from "../../expense.types";

export function DepartmentSummary({ departmentSummary }: { departmentSummary: DeptSummaryType[] }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-slate-950">Department Breakdowns</h2>
        <p className="text-xs text-slate-500 mt-1">Expenses summarized by organizational departments</p>
      </div>

      {departmentSummary.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm text-center text-sm text-slate-500">
          No data available
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {departmentSummary.map((dept, i) => (
            <div
              key={i}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 flex items-start gap-4"
            >
              <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 ring-1 ring-blue-100 text-blue-700">
                <Briefcase className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-800 truncate">{dept.department}</p>
                <p className="mt-2 text-xl font-extrabold text-slate-950">
                  ₹{dept.totalAmount.toLocaleString("en-IN")}
                </p>
                <p className="mt-1 text-xs text-slate-400">{dept.count} claims</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
