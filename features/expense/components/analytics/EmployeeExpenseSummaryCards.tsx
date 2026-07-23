import { CreditCard, CheckCircle2, Clock, AlertOctagon } from "lucide-react";
import { EmployeeExpenseSummary } from "../../expense.types";

export function EmployeeExpenseSummaryCards({ summary }: { summary: EmployeeExpenseSummary }) {
  const cards = [
    {
      label: "Total Expenses",
      value: `₹${summary.totalExpenses.toLocaleString("en-IN")}`,
      count: `${summary.totalExpenseCount} total ${summary.totalExpenseCount === 1 ? "claim" : "claims"}`,
      icon: <CreditCard className="h-5 w-5 text-blue-700" />,
      bgClass: "bg-blue-50 ring-blue-100",
    },
    {
      label: "Approved",
      value: `₹${summary.approvedAmount.toLocaleString("en-IN")}`,
      count: `${summary.approvedCount} approved ${summary.approvedCount === 1 ? "claim" : "claims"}`,
      icon: <CheckCircle2 className="h-5 w-5 text-emerald-700" />,
      bgClass: "bg-emerald-50 ring-emerald-100",
    },
    {
      label: "Pending",
      value: `₹${summary.pendingAmount.toLocaleString("en-IN")}`,
      count: `${summary.pendingCount} pending ${summary.pendingCount === 1 ? "claim" : "claims"}`,
      icon: <Clock className="h-5 w-5 text-amber-700" />,
      bgClass: "bg-amber-50 ring-amber-100",
    },
    {
      label: "Rejected",
      value: `₹${summary.rejectedAmount.toLocaleString("en-IN")}`,
      count: `${summary.rejectedCount} rejected ${summary.rejectedCount === 1 ? "claim" : "claims"}`,
      icon: <AlertOctagon className="h-5 w-5 text-red-700" />,
      bgClass: "bg-red-50 ring-red-100",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c, i) => (
        <div
          key={i}
          className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300"
        >
          <div className="flex items-center justify-between">
            <span className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ring-1 ${c.bgClass}`}>
              {c.icon}
            </span>
          </div>
          <p className="mt-5 text-sm font-medium text-slate-500">{c.label}</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">{c.value}</p>
          <p className="mt-1 text-xs text-slate-400">{c.count}</p>
        </div>
      ))}
    </div>
  );
}
