"use client";

import React, { useState } from "react";
import { CreditCard, CheckCircle2, AlertTriangle, Wallet, Info, Activity, TrendingUp } from "lucide-react";
import { Expense } from "../expense.types";
import { calculateEmployeeWallet } from "../expense.calculations";

interface EmployeeExpenseWalletProps {
  expenses: Expense[];
}

export default function EmployeeExpenseWallet({ expenses }: EmployeeExpenseWalletProps) {
  const [isOpen, setIsOpen] = useState(true);

  // Compute all wallet & statistics from calculations helper
  const wallet = calculateEmployeeWallet(expenses);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden animate-fade-in transition-all">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 text-left border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-100 rounded-lg text-slate-700">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Expense Wallet & Insights</h3>
            <p className="text-xs text-slate-500">Track balance, statistics, and monthly category claims</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
            {isOpen ? "Collapse" : "Expand"}
          </span>
        </div>
      </button>

      {isOpen && (
        <div className="p-6 space-y-6">
          {/* Wallet Summary Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Total Requested */}
            <div className="rounded-xl border border-slate-100 bg-slate-50/40 p-5 transition hover:shadow-sm">
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

            {/* Total Approved */}
            <div className="rounded-xl border border-slate-100 bg-slate-50/40 p-5 transition hover:shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Approved</span>
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                  <CheckCircle2 className="h-4 w-4" />
                </span>
              </div>
              <p className="mt-4 text-2xl font-bold text-slate-900">
                ₹{wallet.totalApproved.toLocaleString("en-IN")}
              </p>
              <p className="mt-1 text-xs text-slate-400">{wallet.approvedCount} approved claims</p>
            </div>

            {/* Total Rejected */}
            <div className="rounded-xl border border-slate-100 bg-slate-50/40 p-5 transition hover:shadow-sm">
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

            {/* Total Personal Spend */}
            <div className="rounded-xl border border-slate-100 bg-slate-50/40 p-5 transition hover:shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Personal Spend</span>
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100">
                  <TrendingUp className="h-4 w-4" />
                </span>
              </div>
              <p className="mt-4 text-2xl font-bold text-slate-900">
                ₹{wallet.totalPersonalSpend.toLocaleString("en-IN")}
              </p>
              <p className="mt-1 text-xs text-slate-400">Approved personal reimbursables</p>
            </div>
          </div>

          {/* Stats, Tables, and Category breakdown Grid */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Stats list & Recent activity */}
            <div className="space-y-6">
              {/* Expense Statistics */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
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
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
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
                                day: "numeric",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit"
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

            {/* Monthly Purchase Summary table */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
              <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                Monthly Purchase Summary
              </h4>
              {wallet.monthlySummary.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-8">No monthly records found</p>
              ) : (
                <div className="overflow-hidden border border-slate-100 rounded-lg">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
                        <th className="p-3">Month</th>
                        <th className="p-3 text-center">Expenses</th>
                        <th className="p-3 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {wallet.monthlySummary.map((row) => (
                        <tr key={row.month} className="hover:bg-slate-50/40">
                          <td className="p-3 font-semibold text-slate-700">{row.month}</td>
                          <td className="p-3 text-center text-slate-500">{row.expensesCount}</td>
                          <td className="p-3 text-right font-bold text-slate-900">₹{row.amount.toLocaleString("en-IN")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Expense Categories summary table */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
              <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                Category Spending
              </h4>
              <div className="overflow-hidden border border-slate-100 rounded-lg">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
                      <th className="p-3">Category</th>
                      <th className="p-3 text-right">Claims</th>
                      <th className="p-3 text-right">Amount</th>
                      <th className="p-3 text-right">Share</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {wallet.categorySummary.map((row) => (
                      <tr key={row.category} className="hover:bg-slate-50/40">
                        <td className="p-3 font-semibold text-slate-700">{row.category}</td>
                        <td className="p-3 text-right text-slate-500">{row.count}</td>
                        <td className="p-3 text-right font-bold text-slate-900">₹{row.amount.toLocaleString("en-IN")}</td>
                        <td className="p-3 text-right font-medium text-slate-400">{row.percentage.toFixed(1)}%</td>
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
