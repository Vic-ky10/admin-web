/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { getAdminExpensesUnfilteredAction, getAllCashOutsAction } from "../../expense.action";
import { ExpenseWithEmployee, ExpenseCashOut } from "../../expense.types";
import { createClient } from "@/lib/supabase/client";
import AdminExpenseAnalytics from "../AdminExpenseAnalytics";
import { AlertCircle, RefreshCw } from "lucide-react";
import Button from "@/components/ui/Button";

export default function AdminExpenseTrackerClient() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expenses, setExpenses] = useState<ExpenseWithEmployee[]>([]);
  const [cashOuts, setCashOuts] = useState<ExpenseCashOut[]>([]);

  const fetchExpenses = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAdminExpensesUnfilteredAction();
      if (response.success && response.data) {
        setExpenses(response.data);
        const coRes = await getAllCashOutsAction();
        setCashOuts(coRes);
      } else {
        setError(response.error || "Failed to fetch organization expense analytics.");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred while loading analytics.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();

    const supabase = createClient();
    const channel = supabase
      .channel("expense-tracker-admin")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "expense_cash_outs" },
        () => {
          fetchExpenses();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "expenses" },
        () => {
          fetchExpenses();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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
          <Button onClick={fetchExpenses}>
            <span className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </span>
          </Button>
        </div>
      </div>
    );
  }

  if (expenses.length === 0) {
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
    <div className="space-y-6">
      <AdminExpenseAnalytics expenses={expenses} cashOuts={cashOuts} defaultOpen={true} />
    </div>
  );
}
