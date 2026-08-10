"use client";

import React, { useState, useMemo } from "react";
import { 
  Building2, 
  Layers, 
  Users, 
  Award, 
  ChevronDown,
  ChevronUp,
  BarChart3,
  Lightbulb,
  CheckCircle2,
  Clock,
  CreditCard
} from "lucide-react";
import { ExpenseWithEmployee, ExpenseCashOut } from "../expense.types";
import { calculateAdminAnalytics } from "../expense.calculations";

interface AdminExpenseAnalyticsProps {
  expenses: ExpenseWithEmployee[];
  cashOuts?: ExpenseCashOut[];
  defaultOpen?: boolean;
}

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

export default function AdminExpenseAnalytics({ expenses, cashOuts = [], defaultOpen = false }: AdminExpenseAnalyticsProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  // Month & Year selection for company historical spending
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedEmployee, setSelectedEmployee] = useState<string>("all");

  // Calculate admin analytics client side
  const analytics = useMemo(() => {
    return calculateAdminAnalytics(expenses, cashOuts);
  }, [expenses, cashOuts]);

  // Extract unique sorted employees list
  const employeesList = useMemo(() => {
    const list: { id: string; name: string }[] = [];
    const seen = new Set<string>();
    expenses.forEach((e) => {
      if (e.employee && !seen.has(e.profile_id)) {
        seen.add(e.profile_id);
        list.push({ id: e.profile_id, name: e.employee.full_name });
      }
    });
    list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [expenses]);

  // Calculate overview metrics (dashboard style)
  const now = new Date();
  const formatMonthKey = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
  };

  const currentMonthKey = formatMonthKey(now);
  const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthKey = formatMonthKey(prevMonthDate);

  const currentMonthSpend = expenses
    .filter((e) => e.expense_date && e.expense_date.startsWith(currentMonthKey))
    .reduce((sum, e) => sum + e.amount, 0);

  const prevMonthSpend = expenses
    .filter((e) => e.expense_date && e.expense_date.startsWith(prevMonthKey))
    .reduce((sum, e) => sum + e.amount, 0);

  // Filter historical expenses by selected employee, month & year
  const matchMonthKey = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}`;
  const filteredHistoricalExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const matchesDate = e.expense_date && e.expense_date.startsWith(matchMonthKey);
      const matchesEmployee = selectedEmployee === "all" || e.profile_id === selectedEmployee;
      return matchesDate && matchesEmployee;
    });
  }, [expenses, matchMonthKey, selectedEmployee]);

  const historicalTotalSpend = useMemo(() => {
    return filteredHistoricalExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [filteredHistoricalExpenses]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden transition-all duration-300">
      {/* Header / Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 text-left border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-100 rounded-lg text-slate-700">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Organization Analytics & Insights</h3>
            <p className="text-xs text-slate-500">Track budgets, department spending, top claims, and employee patterns</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
            {isOpen ? "Hide Analytics" : "Show Analytics"}
          </span>
          {isOpen ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-6 space-y-8 animate-fade-in">
          {/* 1. Overview Cards (Dashboard Style) */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Current Month Spending Card */}
            <div className="group flex flex-col justify-between h-full rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all duration-200 hover:border-blue-300">
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
            <div className="group flex flex-col justify-between h-full rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all duration-200 hover:border-indigo-300">
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

          {/* 2. Company Expense Summary Cards */}
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Company Expense Summary</h4>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
              {/* Total Requests */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/30 p-4 transition hover:bg-slate-50/60">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Total Requests</span>
                <p className="mt-2 text-xl font-extrabold text-slate-900">{analytics.totalExpenseCount}</p>
                <p className="text-[10px] text-slate-400 mt-1">Submitted claims</p>
              </div>

              {/* Total Requested Amount */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/30 p-4 transition hover:bg-slate-50/60">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Requested Amount</span>
                <p className="mt-2 text-xl font-extrabold text-slate-900">₹{analytics.totalCompanyExpense.toLocaleString("en-IN")}</p>
                <p className="text-[10px] text-slate-400 mt-1">Total claims value</p>
              </div>

              {/* Total Approved Amount */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/30 p-4 transition hover:bg-slate-50/60">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Approved Amount</span>
                <p className="mt-2 text-xl font-extrabold text-emerald-700">₹{analytics.approvedAmount.toLocaleString("en-IN")}</p>
                <p className="text-[10px] text-slate-400 mt-1">Reimbursed amount</p>
              </div>

              {/* Total Pending Amount */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/30 p-4 transition hover:bg-slate-50/60">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Pending Amount</span>
                <p className="mt-2 text-xl font-extrabold text-amber-700">₹{analytics.pendingAmount.toLocaleString("en-IN")}</p>
                <p className="text-[10px] text-slate-400 mt-1">Claims in review</p>
              </div>

              {/* Total Rejected Amount */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/30 p-4 transition hover:bg-slate-50/60">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Rejected Amount</span>
                <p className="mt-2 text-xl font-extrabold text-red-700">₹{analytics.rejectedAmount.toLocaleString("en-IN")}</p>
                <p className="text-[10px] text-slate-400 mt-1">Disallowed claims</p>
              </div>

              {/* Average Expense Value */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/30 p-4 transition hover:bg-slate-50/60">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Average Value</span>
                <p className="mt-2 text-xl font-extrabold text-slate-900">₹{Math.round(analytics.averageExpenseValue).toLocaleString("en-IN")}</p>
                <p className="text-[10px] text-slate-400 mt-1">Per submission</p>
              </div>
            </div>
          </div>

          {/* Top Insights Section */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/30 p-5 space-y-4">
            <h4 className="text-sm font-bold text-slate-950 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              Strategic Spending Insights
            </h4>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* Insight 1: Highest Spender */}
              <div className="bg-white p-3.5 rounded-lg border border-slate-100 shadow-sm flex items-start gap-3">
                <span className="p-2 bg-slate-50 rounded text-slate-600 shrink-0"><Users className="h-4 w-4" /></span>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Highest Spending Employee</p>
                  <p className="text-sm font-semibold text-slate-800 mt-0.5">{analytics.topInsights.highestSpendingEmployee}</p>
                </div>
              </div>

              {/* Insight 2: Most Active */}
              <div className="bg-white p-3.5 rounded-lg border border-slate-100 shadow-sm flex items-start gap-3">
                <span className="p-2 bg-slate-50 rounded text-slate-600 shrink-0"><Award className="h-4 w-4" /></span>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Most Active Employee</p>
                  <p className="text-sm font-semibold text-slate-800 mt-0.5">{analytics.topInsights.mostActiveEmployee}</p>
                </div>
              </div>

              {/* Insight 3: Highest Spending Dept */}
              <div className="bg-white p-3.5 rounded-lg border border-slate-100 shadow-sm flex items-start gap-3">
                <span className="p-2 bg-slate-50 rounded text-slate-600 shrink-0"><Building2 className="h-4 w-4" /></span>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Highest Spending Department</p>
                  <p className="text-sm font-semibold text-slate-800 mt-0.5">{analytics.topInsights.highestSpendingDepartment}</p>
                </div>
              </div>

              {/* Insight 4: Most Used Category */}
              <div className="bg-white p-3.5 rounded-lg border border-slate-100 shadow-sm flex items-start gap-3">
                <span className="p-2 bg-slate-50 rounded text-slate-600 shrink-0"><Layers className="h-4 w-4" /></span>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Most Used Category</p>
                  <p className="text-sm font-semibold text-slate-800 mt-0.5">{analytics.topInsights.mostUsedCategory}</p>
                </div>
              </div>

              {/* Insight 5: Largest Approved Claim */}
              <div className="bg-white p-3.5 rounded-lg border border-slate-100 shadow-sm flex items-start gap-3">
                <span className="p-2 bg-emerald-50 rounded text-emerald-600 shrink-0"><CheckCircle2 className="h-4 w-4" /></span>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Largest Approved Expense</p>
                  <p className="text-sm font-semibold text-slate-800 mt-0.5">
                    {analytics.topInsights.largestApprovedExpense
                      ? `₹${analytics.topInsights.largestApprovedExpense.amount.toLocaleString("en-IN")} (${analytics.topInsights.largestApprovedExpense.employeeName})`
                      : "None"}
                  </p>
                </div>
              </div>

              {/* Insight 6: Largest Pending Claim */}
              <div className="bg-white p-3.5 rounded-lg border border-slate-100 shadow-sm flex items-start gap-3">
                <span className="p-2 bg-amber-50 rounded text-amber-600 shrink-0"><Clock className="h-4 w-4" /></span>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Largest Pending Expense</p>
                  <p className="text-sm font-semibold text-slate-800 mt-0.5">
                    {analytics.topInsights.largestPendingExpense
                      ? `₹${analytics.topInsights.largestPendingExpense.amount.toLocaleString("en-IN")} (${analytics.topInsights.largestPendingExpense.employeeName})`
                      : "None"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Historical Monthly Spending Table */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="text-sm font-bold text-slate-900">Monthly Spending History</h4>
              <div className="flex items-center gap-2">
                {/* Employee Picker */}
                <select
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  className="text-xs border border-slate-200 rounded px-2.5 py-1 bg-white focus:border-blue-500 outline-none"
                >
                  <option value="all">All Employees</option>
                  {employeesList.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name}
                    </option>
                  ))}
                </select>
                {/* Month Picker */}
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="text-xs border border-slate-200 rounded px-2.5 py-1 bg-white focus:border-blue-500 outline-none"
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
                  className="text-xs border border-slate-200 rounded px-2.5 py-1 bg-white focus:border-blue-500 outline-none"
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
              <p className="text-xs text-slate-400 text-center py-12 bg-slate-50/50 rounded-lg border border-slate-100">
                No organization expense claims found for the selected period.
              </p>
            ) : (
              <div className="overflow-x-auto border border-slate-100 rounded-lg">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
                      <th className="p-3">Employee</th>
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
                          <td colSpan={4} className="p-2 px-3 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                            {date}
                          </td>
                        </tr>
                        {items.map((row) => (
                          <tr key={row.id} className="hover:bg-slate-50/40">
                            <td className="p-3">
                              <p className="font-semibold text-slate-800">{row.employee?.full_name || "Unknown"}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">{row.employee?.department || "Other"}</p>
                            </td>
                            <td className="p-3">
                              <p className="font-medium text-slate-700">{row.description || "Untitled"}</p>
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

          {/* Employee Wallet Overview Table */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Employee Wallet Overview</h4>
            {analytics.employeeWalletOverview.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No employee wallet data</p>
            ) : (
              <div className="overflow-x-auto border border-slate-100 rounded-lg">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
                      <th className="p-3">Employee</th>
                      <th className="p-3">Department</th>
                      <th className="p-3 text-right">Total Cash In</th>
                      <th className="p-3 text-right">Cash Out</th>
                      <th className="p-3 text-right">Balance</th>
                      <th className="p-3 text-right">Total Pending</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {analytics.employeeWalletOverview.map((row) => (
                      <tr key={row.profileId} className="hover:bg-slate-50/40">
                        <td className="p-3 font-semibold text-slate-800">{row.name}</td>
                        <td className="p-3 text-slate-600">{row.department}</td>
                        <td className="p-3 text-right font-semibold text-slate-700">₹{row.totalApproved.toLocaleString("en-IN")}</td>
                        <td className="p-3 text-right font-semibold text-slate-700">₹{row.totalSpent.toLocaleString("en-IN")}</td>
                        <td className="p-3 text-right font-bold text-emerald-600">₹{(row.walletBalance ?? 0).toLocaleString("en-IN")}</td>
                        <td className="p-3 text-right font-semibold text-slate-700">₹{row.totalPending.toLocaleString("en-IN")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Department & Category Breakdown grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Department Summary Table */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
              <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Department Expense Summary</h4>
              {analytics.departmentSummary.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-8">No department records</p>
              ) : (
                <div className="overflow-hidden border border-slate-100 rounded-lg">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
                        <th className="p-3">Department</th>
                        <th className="p-3 text-center">Total Requests</th>
                        <th className="p-3 text-right">Approved Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {analytics.departmentSummary.map((row) => (
                        <tr key={row.department} className="hover:bg-slate-50/40">
                          <td className="p-3 font-semibold text-slate-700">{row.department}</td>
                          <td className="p-3 text-center text-slate-500">{row.totalRequests}</td>
                          <td className="p-3 text-right font-bold text-slate-900">₹{row.approvedAmount.toLocaleString("en-IN")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Category Summary Table (No percentage column) */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
              <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Category Spending Summary</h4>
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
                    {analytics.categorySummary.map((row) => (
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
      )}
    </div>
  );
}
