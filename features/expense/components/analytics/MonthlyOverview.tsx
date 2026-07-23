import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import { MonthlySummary } from "../../expense.types";

export function MonthlyOverview({ monthlySummary }: { monthlySummary: MonthlySummary[] }) {
  const now = new Date();
  const formatMonthKey = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
  };

  const currentMonthKey = formatMonthKey(now);
  const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthKey = formatMonthKey(prevMonthDate);

  const currentData = monthlySummary.find((m) => m.month === currentMonthKey);
  const prevData = monthlySummary.find((m) => m.month === prevMonthKey);

  const currentAmount = currentData?.amount ?? 0;
  const prevAmount = prevData?.amount ?? 0;

  const diff = currentAmount - prevAmount;
  const diffPercent = prevAmount > 0 ? (diff / prevAmount) * 100 : 0;

  const getMonthName = (key: string) => {
    const [year, month] = key.split("-");
    const d = new Date(Number(year), Number(month) - 1, 1);
    return d.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  };

  const currentMonthName = getMonthName(currentMonthKey);
  const prevMonthName = getMonthName(prevMonthKey);

  const maxAmount = Math.max(currentAmount, prevAmount, 1);
  const currentProgress = (currentAmount / maxAmount) * 100;
  const prevProgress = (prevAmount / maxAmount) * 100;

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-slate-950">Monthly Expense Overview</h2>
      <p className="text-xs text-slate-500 mt-1">Comparison of the current and previous months</p>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between text-sm font-semibold text-slate-700">
              <span>{currentMonthName} (Current)</span>
              <span className="text-slate-900">₹{currentAmount.toLocaleString("en-IN")}</span>
            </div>
            <div className="mt-2 h-3 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-blue-600 transition-all duration-500"
                style={{ width: `${currentProgress}%` }}
              />
            </div>
            <p className="mt-1 text-[11px] text-slate-400">{currentData?.count ?? 0} claims submitted</p>
          </div>

          <div>
            <div className="flex items-center justify-between text-sm font-semibold text-slate-700">
              <span>{prevMonthName} (Previous)</span>
              <span className="text-slate-900">₹{prevAmount.toLocaleString("en-IN")}</span>
            </div>
            <div className="mt-2 h-3 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-slate-400 transition-all duration-500"
                style={{ width: `${prevProgress}%` }}
              />
            </div>
            <p className="mt-1 text-[11px] text-slate-400">{prevData?.count ?? 0} claims submitted</p>
          </div>
        </div>

        <div className="flex flex-col justify-center rounded-lg bg-slate-50 p-5 border border-slate-100">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Difference</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            ₹{Math.abs(diff).toLocaleString("en-IN")}
          </p>

          <div className="mt-3 flex items-center gap-2">
            {diff > 0 ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-red-50 px-2 py-1 text-xs font-bold text-red-700 ring-1 ring-red-100">
                <TrendingUp className="h-3.5 w-3.5" />
                {diffPercent.toFixed(1)}% higher
              </span>
            ) : diff < 0 ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-100">
                <TrendingDown className="h-3.5 w-3.5" />
                {Math.abs(diffPercent).toFixed(1)}% lower
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">
                <Minus className="h-3.5 w-3.5" />
                No change
              </span>
            )}
            <span className="text-xs text-slate-500">than last month</span>
          </div>
        </div>
      </div>
    </div>
  );
}
