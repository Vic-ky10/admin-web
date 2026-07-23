"use client";

import { useEffect, useState } from "react";
import { getAdminExpenseSummaryAction } from "../../expense.action";
import { AdminExpenseSummary } from "../../expense.types";
import { ExpenseSummaryCards } from "./ExpenseSummaryCards";
import { MonthlyOverview } from "./MonthlyOverview";
import { TopEmployeesTable } from "./TopEmployeesTable";
import { DepartmentSummary } from "./DepartmentSummary";
import { RecentExpenseActivity } from "./RecentExpenseActivity";
import { AlertCircle, RefreshCw } from "lucide-react";
import Button from "@/components/ui/Button";

export default function AdminExpenseTrackerClient() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<AdminExpenseSummary | null>(null);

  const fetchSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAdminExpenseSummaryAction();
      if (response.success && response.data) {
        setSummary(response.data);
      } else {
        setError(response.error || "Failed to fetch expense analytics summary.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred while loading analytics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm space-y-4">
              <div className="h-10 w-10 bg-slate-200 rounded-lg" />
              <div className="h-4 w-24 bg-slate-200 rounded" />
              <div className="h-8 w-16 bg-slate-200 rounded" />
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-lg border border-slate-200 bg-white p-6 shadow-sm h-64 bg-slate-50/50" />
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm h-64 bg-slate-50/50" />
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm h-64 bg-slate-50/50" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-lg font-bold text-red-800">Error Loading Analytics</h3>
        <p className="mt-2 text-sm text-red-700">{error}</p>
        <div className="mt-6 flex justify-center">
          <Button onClick={fetchSummary}>
            <span className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </span>
          </Button>
        </div>
      </div>
    );
  }

  if (!summary || summary.totalExpenseCount === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-12 text-center shadow-sm">
        <h3 className="text-lg font-bold text-slate-900">No Expense Data</h3>
        <p className="mt-2 text-sm text-slate-500">
          There are no expense records found in the organization. Submitted claims will show up here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <ExpenseSummaryCards summary={summary} />

      {/* Monthly Chart and Leaderboard row */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <MonthlyOverview monthlySummary={summary.monthlySummary} />
        </div>
        <div>
          <TopEmployeesTable topEmployees={summary.topEmployees} expenses={summary.recentExpenses} />
        </div>
      </div>

      {/* Department Summary cards */}
      <DepartmentSummary departmentSummary={summary.departmentSummary} />

      {/* Recent Expense activity table */}
      <RecentExpenseActivity recentExpenses={summary.recentExpenses} />
    </div>
  );
}
