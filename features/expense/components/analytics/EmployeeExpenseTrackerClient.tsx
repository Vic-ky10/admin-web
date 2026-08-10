/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  getEmployeeExpensesUnfilteredAction,
  getEmployeeCashOutsAction,
  createCashOutAction
} from "../../expense.action";
import { Expense, ExpenseCashOut } from "../../expense.types";
import { calculateEmployeeWallet } from "../../expense.calculations";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { AlertCircle, RefreshCw, CreditCard, CheckCircle2, AlertTriangle, TrendingUp, Info, Activity } from "lucide-react";
import Button from "@/components/ui/Button";

const MONTH_OPTIONS = [
  { value: 0, label: "January" },
  { value: 1, label: "February" },
  { value: 2, label: "March" },
  { value: 3, label: "April" },
  { value: 4, label: "May" },
  { value: 5, label: "June" },
  { value: 6, label: "July" },
  { value: 7, label: "August" },
  { value: 8, label: "September" },
  { value: 9, label: "October" },
  { value: 10, label: "November" },
  { value: 11, label: "December" }
];

const YEAR_OPTIONS = [2024, 2025, 2026, 2027];

export default function EmployeeExpenseTrackerClient() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [cashOuts, setCashOuts] = useState<ExpenseCashOut[]>([]);

  // Form State for recording Cash Out spending
  const [spendAmount, setSpendAmount] = useState("");
  const [spendDesc, setSpendDesc] = useState("");
  const [spendError, setSpendError] = useState<string | null>(null);

  // Month & Year selection defaults to current month & current year
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const fetchExpenses = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getEmployeeExpensesUnfilteredAction();
      if (response.success && response.data) {
        setExpenses(response.data);
        const coRes = await getEmployeeCashOutsAction();
        setCashOuts(coRes);
      } else {
        setError(response.error || "Failed to fetch your expense tracker data.");
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while loading analytics.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();

    const supabase = createClient();
    const channel = supabase
      .channel("expense-tracker-emp")
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

  // Derived state — must be computed unconditionally before any early returns (Rules of Hooks)
  const now = new Date();
  const formatMonthKey = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
  };
  const currentMonthKey = formatMonthKey(now);
  const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthKey = formatMonthKey(prevMonthDate);
  const wallet = calculateEmployeeWallet(expenses, cashOuts);
  const recentCashIns = useMemo(() => {
    return expenses
      .filter((e) => e.status === "Approved")
      .sort((a, b) => new Date(b.reviewed_at || b.created_at).getTime() - new Date(a.reviewed_at || a.created_at).getTime())
      .slice(0, 3);
  }, [expenses]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
              <div className="h-4 w-24 bg-slate-200 rounded" />
              <div className="h-8 w-16 bg-slate-200 rounded" />
            </div>
          ))}
        </div>
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

  const currentMonthSpend = expenses
    .filter((e) => e.expense_date && e.expense_date.startsWith(currentMonthKey))
    .reduce((sum, e) => sum + e.amount, 0);

  const prevMonthSpend = expenses
    .filter((e) => e.expense_date && e.expense_date.startsWith(prevMonthKey))
    .reduce((sum, e) => sum + e.amount, 0);

  // Filter historical expenses by selected month & year
  const matchMonthKey = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}`;
  const filteredHistoricalExpenses = expenses.filter(
    (e) => e.expense_date && e.expense_date.startsWith(matchMonthKey)
  );
  const historicalTotalSpend = filteredHistoricalExpenses.reduce((sum, e) => sum + e.amount, 0);

  const handleRecordCashOut = async (e: React.FormEvent) => {
    e.preventDefault();
    setSpendError(null);
    const amountNum = parseFloat(spendAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setSpendError("Please enter a valid spending amount greater than 0.");
      return;
    }

    const availableBal = wallet.walletBalance ?? 0;
    if (amountNum > availableBal) {
      setSpendError("Cash Out cannot exceed the available balance.");
      return;
    }

    try {
      const res = await createCashOutAction(amountNum, spendDesc);
      if (res.success) {
        const newBalance = availableBal - amountNum;
        toast.success(`Cash Out recorded successfully. Balance: ₹${newBalance.toLocaleString("en-IN")}`);
        setSpendAmount("");
        setSpendDesc("");
        fetchExpenses();
      } else {
        setSpendError(res.error || "Failed to record cash out.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An error occurred.";
      setSpendError(msg);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Overview Cards (Dashboard Style) */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Current Month Spending Card */}
        <div className="group flex flex-col justify-between h-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:border-blue-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Current Month Spending</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl ring-1 text-blue-700 bg-blue-50 ring-blue-100">
              <CreditCard className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">₹{currentMonthSpend.toLocaleString("en-IN")}</span>
          </div>
        </div>

        {/* Previous Month Spending Card */}
        <div className="group flex flex-col justify-between h-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:border-indigo-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Previous Month Spending</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl ring-1 text-indigo-700 bg-indigo-50 ring-indigo-100">
              <CreditCard className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">₹{prevMonthSpend.toLocaleString("en-IN")}</span>
          </div>
        </div>
      </div>

      {/* 2. Wallet Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {/* Total Cash In */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Cash In</span>
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
              <CheckCircle2 className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-4 text-2xl font-bold text-slate-900">
            ₹{wallet.totalApproved.toLocaleString("en-IN")}
          </p>
          <p className="mt-1 text-xs text-slate-400">{wallet.approvedCount} approved claims</p>
        </div>

        {/* Cash Out */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Cash Out</span>
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100">
              <TrendingUp className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-4 text-2xl font-bold text-slate-900">
            ₹{wallet.totalPersonalSpend.toLocaleString("en-IN")}
          </p>
          <p className="mt-1 text-xs text-slate-400">Actual spending recorded</p>
        </div>

        {/* Balance */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Balance</span>
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-700 ring-1 ring-blue-100">
              <Activity className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-4 text-2xl font-bold text-slate-900">
            ₹{(wallet.walletBalance ?? 0).toLocaleString("en-IN")}
          </p>
          <p className="mt-1 text-xs text-slate-400">Available wallet balance</p>
        </div>

        {/* Total Requested */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Requested</span>
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-700 ring-1 ring-blue-100">
              <CreditCard className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-4 text-2xl font-bold text-slate-900">
            ₹{wallet.totalRequested.toLocaleString("en-IN")}
          </p>
          <p className="mt-1 text-xs text-slate-400">{wallet.totalRequests} claims submitted</p>
        </div>

        {/* Total Rejected */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Rejected</span>
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-700 ring-1 ring-red-100">
              <AlertTriangle className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-4 text-2xl font-bold text-slate-900">
            ₹{wallet.totalRejected.toLocaleString("en-IN")}
          </p>
          <p className="mt-1 text-xs text-slate-400">{wallet.rejectedCount} rejected claims</p>
        </div>
      </div>

      {/* 3. Main Grid Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Statistics & Activity */}
        <div className="space-y-6 lg:col-span-1">
          {/* Record Cash Out Form */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <h4 className="text-sm font-bold text-slate-950 flex items-center gap-2 border-b border-slate-100 pb-2">
              <TrendingUp className="h-4 w-4 text-indigo-500" />
              Record Cash Out
            </h4>
            <form onSubmit={handleRecordCashOut} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={spendAmount}
                  onChange={(e) => setSpendAmount(e.target.value)}
                  placeholder="Enter spend amount..."
                  disabled={(wallet.walletBalance ?? 0) <= 0}
                  className="w-full text-xs border border-slate-200 rounded px-3 py-2 bg-white focus:border-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Description</label>
                <input
                  type="text"
                  value={spendDesc}
                  onChange={(e) => setSpendDesc(e.target.value)}
                  placeholder="What did you spend this on?"
                  disabled={(wallet.walletBalance ?? 0) <= 0}
                  className="w-full text-xs border border-slate-200 rounded px-3 py-2 bg-white focus:border-indigo-500 outline-none"
                />
              </div>
              {spendError && <p className="text-[11px] font-semibold text-red-500">{spendError}</p>}
              <button
                type="submit"
                disabled={(wallet.walletBalance ?? 0) <= 0 || loading || !spendAmount}
                className="w-full bg-indigo-600 text-white font-bold py-2 rounded text-xs hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {(wallet.walletBalance ?? 0) <= 0 ? "Zero Wallet Balance" : "Save Spend"}
              </button>
            </form>
          </div>

          {/* Recent Cash In Section */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
            <h4 className="text-sm font-bold text-slate-955 flex items-center gap-2 border-b border-slate-100 pb-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Recent Cash In
            </h4>
            {recentCashIns.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No recent cash in logs</p>
            ) : (
              <div className="space-y-3">
                {recentCashIns.map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-xs border-b border-slate-50 pb-2 last:border-b-0 last:pb-0">
                    <div>
                      <p className="font-semibold text-slate-700">{item.description || item.expense_type}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Approved / Received • {new Date(item.reviewed_at || item.created_at).toLocaleDateString("en-IN")}</p>
                    </div>
                    <span className="font-bold text-emerald-600">₹{(item.approved_amount ?? item.amount).toLocaleString("en-IN")}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Cash Out Section */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
            <h4 className="text-sm font-bold text-slate-950 flex items-center gap-2 border-b border-slate-100 pb-2">
              <TrendingUp className="h-4 w-4 text-indigo-500" />
              Recent Cash Out
            </h4>
            {cashOuts.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No spending recorded yet</p>
            ) : (
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {cashOuts.map((c) => (
                  <div key={c.id} className="flex justify-between items-center text-xs border-b border-slate-50 pb-2 last:border-b-0 last:pb-0">
                    <div>
                      <p className="font-semibold text-slate-700">{c.description || "General Spending"}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{new Date(c.created_at).toLocaleDateString("en-IN")}</p>
                    </div>
                    <span className="font-bold text-slate-900">₹{c.amount.toLocaleString("en-IN")}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Expense Statistics */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <h4 className="text-sm font-bold text-slate-950 flex items-center gap-2 border-b border-slate-100 pb-2">
              <Info className="h-4 w-4 text-slate-400" />
              Expense Statistics
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Pending Claims</span>
                <p className="text-base font-bold text-slate-900 mt-0.5">{wallet.pendingCount}</p>
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Approved Claims</span>
                <p className="text-base font-bold text-slate-900 mt-0.5">{wallet.approvedCount}</p>
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Average Amount</span>
                <p className="text-base font-bold text-slate-900 mt-0.5">₹{Math.round(wallet.averageExpense).toLocaleString("en-IN")}</p>
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Total Submissions</span>
                <p className="text-base font-bold text-slate-900 mt-0.5">{wallet.totalRequests}</p>
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Highest Expense</span>
                <p className="text-base font-bold text-slate-900 mt-0.5">₹{wallet.highestExpense.toLocaleString("en-IN")}</p>
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Lowest Expense</span>
                <p className="text-base font-bold text-slate-900 mt-0.5">₹{wallet.lowestExpense.toLocaleString("en-IN")}</p>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <h4 className="text-sm font-bold text-slate-950 flex items-center gap-2 border-b border-slate-100 pb-2">
              <Activity className="h-4 w-4 text-slate-400" />
              Recent Activity
            </h4>
            {wallet.recentActivity.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No recent activity logs</p>
            ) : (
              <div className="space-y-3.5">
                {wallet.recentActivity.map((act) => {
                  let statusText = "Submitted";
                  let colorClass = "text-blue-600 bg-blue-50 border-blue-100";

                  if (act.status === "Approved") {
                    statusText = "Approved";
                    colorClass = "text-emerald-600 bg-emerald-50 border-emerald-100";
                  } else if (act.status === "Rejected") {
                    statusText = "Rejected";
                    colorClass = "text-red-600 bg-red-50 border-red-100";
                  }

                  return (
                    <div key={act.id} className="flex items-start gap-3 text-xs leading-normal">
                      <span className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-bold border ${colorClass} shrink-0`}>
                        {statusText}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-700 truncate">{act.description || act.expense_type}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {new Date(act.created_at).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short"
                          })}
                        </p>
                      </div>
                      <span className="font-bold text-slate-900 shrink-0">
                        ₹{act.amount.toLocaleString("en-IN")}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Center/Right Column: Historical Monthly Spending Section & Category Summary Table */}
        <div className="lg:col-span-2 space-y-6">
          {/* Historical Monthly Spending with Month & Year pickers */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-2">
              <h4 className="text-sm font-bold text-slate-950">
                Monthly Spending History
              </h4>
              <div className="flex items-center gap-2">
                {/* Month Picker */}
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="text-xs border border-slate-200 rounded px-2.5 py-1 bg-white focus:border-blue-500 outline-none animate-none"
                >
                  {MONTH_OPTIONS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
                {/* Year Picker */}
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="text-xs border border-slate-200 rounded px-2.5 py-1 bg-white focus:border-blue-500 outline-none animate-none"
                >
                  {YEAR_OPTIONS.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {filteredHistoricalExpenses.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-12">No expense claims found for the selected period.</p>
            ) : (
              <div className="overflow-hidden border border-slate-100 rounded-lg">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
                      <th className="p-3">Type</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {Object.entries(
                      filteredHistoricalExpenses.reduce((acc, row) => {
                        const dateStr = new Date(row.expense_date).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric"
                        });
                        if (!acc[dateStr]) acc[dateStr] = [];
                        acc[dateStr].push(row);
                        return acc;
                      }, {} as Record<string, typeof filteredHistoricalExpenses>)
                    ).map(([date, items]) => (
                      <React.Fragment key={date}>
                        <tr className="bg-slate-50/80 border-y border-slate-100">
                          <td colSpan={3} className="p-2 px-3 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                            {date}
                          </td>
                        </tr>
                        {items.map((row) => (
                          <tr key={row.id} className="hover:bg-slate-50/40">
                            <td className="p-3">
                              <p className="font-medium text-slate-900">{row.description || "Untitled"}</p>
                              <p className="text-[10px] text-slate-500 mt-0.5">{row.expense_type}</p>
                            </td>
                            <td className="p-3">
                              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                row.status === "Approved"
                                  ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/10"
                                  : row.status === "Rejected"
                                  ? "bg-red-50 text-red-700 ring-1 ring-red-600/10"
                                  : "bg-amber-50 text-amber-700 ring-1 ring-amber-600/10"
                              }`}>
                                {row.status}
                              </span>
                            </td>
                            <td className="p-3 text-right font-bold text-slate-900">₹{row.amount.toLocaleString("en-IN")}</td>
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Bottom summary fields */}
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg text-xs font-semibold text-slate-700">
              <span>Total Claims: {filteredHistoricalExpenses.length}</span>
              <span className="text-slate-900 font-bold text-sm">
                Total Spending: ₹{historicalTotalSpend.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          {/* Category Spending Table */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <h4 className="text-sm font-bold text-slate-950 border-b border-slate-100 pb-2">
              Category Spending
            </h4>
            <div className="overflow-hidden border border-slate-100 rounded-lg">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
                    <th className="p-3">Category</th>
                    <th className="p-3 text-right">Claims</th>
                    <th className="p-3 text-right">Total Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {wallet.categorySummary.map((row) => (
                    <tr key={row.category} className="hover:bg-slate-50/40">
                      <td className="p-3 font-semibold text-slate-700">{row.category}</td>
                      <td className="p-3 text-right text-slate-500">{row.count}</td>
                      <td className="p-3 text-right font-bold text-slate-900">₹{row.amount.toLocaleString("en-IN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
