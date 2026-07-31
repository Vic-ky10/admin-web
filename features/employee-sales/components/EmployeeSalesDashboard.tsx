"use client";

import { TrendingUp, Users, DollarSign, Calendar, Clock, CheckCircle, Edit2, Trash2 } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

interface DashboardStats {
  totalRevenue: number;
  monthlyRevenue: number;
  monthlySales: number;
  totalCustomers: number;
  totalPurchases: number;
  pendingFollowupsCount: number;
  completedFollowupsCount: number;
  todayFollowupsCount: number;
  earnedIncentives: number;
}

interface UpcomingFollowup {
  id: string;
  customerName: string;
  customerCode: string;
  date: string;
  priority: "High" | "Medium" | "Low";
  type: string;
}

interface RecentCustomer {
  id: string;
  customer_code: string;
  full_name: string;
  phone: string;
  email: string | null;
  areaName: string;
  status: string;
}

interface RecentPurchase {
  id: string;
  purchase_code: string;
  customerName: string;
  amount: number;
  incentive_amount: number;
  purchase_date: string;
  status: string;
}

interface RecentActivity {
  id: string;
  type: string;
  title: string;
  description: string;
  date: string;
}

interface MonthlyTrendItem {
  label: string;
  amount: number;
}

interface EmployeeSalesDashboardProps {
  stats: DashboardStats;
  upcomingFollowups: UpcomingFollowup[];
  recentCustomers: RecentCustomer[];
  recentPurchases: RecentPurchase[];
  recentActivities: RecentActivity[];
  monthlyTrend: MonthlyTrendItem[];
  onViewCustomer: (id: string) => void;
  onEditPurchase?: (id: string) => void;
  onDeletePurchase?: (id: string) => void;
  deletingId?: string | null;
}

export default function EmployeeSalesDashboard({
  stats,
  upcomingFollowups,
  recentCustomers,
  recentPurchases,
  recentActivities,
  monthlyTrend,
  onViewCustomer,
  onEditPurchase,
  onDeletePurchase,
  deletingId = null,
}: EmployeeSalesDashboardProps) {
  // Chart layout settings
  const maxChartAmount = Math.max(...monthlyTrend.map((d) => d.amount), 10000);

  // KPI card configurations
  const kpiCards = [
    {
      title: "Total Revenue",
      value: `₹${stats.totalRevenue.toLocaleString("en-IN")}`,
      icon: <DollarSign className="h-5 w-5 text-emerald-700" />,
      bgClass: "bg-emerald-50 ring-emerald-100",
      trend: "Your approved sales sum",
    },
    {
      title: "This Month Revenue",
      value: `₹${stats.monthlyRevenue.toLocaleString("en-IN")}`,
      icon: <TrendingUp className="h-5 w-5 text-emerald-700" />,
      bgClass: "bg-emerald-50 ring-emerald-100",
      trend: `${stats.monthlySales} approved sales this month`,
    },
    {
      title: "My Customers",
      value: stats.totalCustomers.toString(),
      icon: <Users className="h-5 w-5 text-emerald-700" />,
      bgClass: "bg-emerald-50 ring-emerald-100",
      trend: "Assigned contacts",
    },
    {
      title: "Logged Purchases",
      value: stats.totalPurchases.toString(),
      icon: <CheckCircle className="h-5 w-5 text-emerald-700" />,
      bgClass: "bg-emerald-50 ring-emerald-100",
      trend: "All invoice records",
    },
    {
      title: "Earned Incentives",
      value: `₹${stats.earnedIncentives.toLocaleString("en-IN")}`,
      icon: <CheckCircle className="h-5 w-5 text-emerald-700" />,
      bgClass: "bg-emerald-50 ring-emerald-100",
      trend: "Approved commissions",
    },
    {
      title: "Today's Follow-ups",
      value: stats.todayFollowupsCount.toString(),
      icon: <Calendar className="h-5 w-5 text-emerald-700" />,
      bgClass: "bg-emerald-50 ring-emerald-100",
      trend: "Scheduled for today",
    },
    {
      title: "Pending Follow-ups",
      value: stats.pendingFollowupsCount.toString(),
      icon: <Clock className="h-5 w-5 text-emerald-700" />,
      bgClass: "bg-emerald-50 ring-emerald-100",
      trend: "Future schedule",
    },
    {
      title: "Completed Follow-ups",
      value: stats.completedFollowupsCount.toString(),
      icon: <CheckCircle className="h-5 w-5 text-emerald-700" />,
      bgClass: "bg-emerald-50 ring-emerald-100",
      trend: "Logged interactions",
    },
  ];

  return (
    <div className="space-y-6">
      {/* 4x2 Grid of KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((card, idx) => (
          <div
            key={idx}
            className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {card.title}
              </span>
              <span className={`rounded-lg p-2 ring-1 ${card.bgClass}`}>
                {card.icon}
              </span>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {card.value}
              </p>
              <p className="mt-1.5 text-xs text-slate-500 font-medium">
                {card.trend}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Row 2: Monthly Trend Chart & Upcoming Followups */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* CSS Chart */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
            Monthly Revenue Trend (Approved Sales)
          </h2>

          <div className="flex h-64 items-end gap-4 px-2 pt-6">
            {monthlyTrend.map((data, index) => {
              const heightPercent = Math.max((data.amount / maxChartAmount) * 100, 3);
              return (
                <div key={index} className="group flex flex-1 flex-col items-center gap-2 h-full justify-end">
                  <div className="relative w-full flex justify-center">
                    {/* Tooltip */}
                    <span className="absolute -top-10 scale-0 group-hover:scale-100 rounded bg-slate-900 px-2 py-1 text-[11px] font-bold text-white shadow-lg transition duration-200 z-10 whitespace-nowrap">
                      ₹{data.amount.toLocaleString("en-IN")}
                    </span>
                  </div>
                  {/* CSS Chart Bar */}
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full rounded-t-lg bg-gradient-to-t from-emerald-600 to-emerald-400 transition-all duration-300 group-hover:from-emerald-700 group-hover:to-emerald-500 shadow-sm"
                  />
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    {data.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Followups */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-emerald-600" />
            Upcoming Follow-ups
          </h2>
          <div className="divide-y divide-slate-100">
            {upcomingFollowups.length === 0 ? (
              <div className="py-12 text-center text-sm text-slate-500 font-medium">
                No upcoming follow-ups scheduled.
              </div>
            ) : (
              upcomingFollowups.map((f) => (
                <div key={f.id} className="py-3 first:pt-0 last:pb-0 flex items-start justify-between">
                  <div>
                    <span className="text-xs text-slate-400 font-semibold block uppercase">
                      {f.type} • {new Date(f.date).toLocaleDateString("en-IN")}
                    </span>
                    <button
                      onClick={() => onViewCustomer(f.customerName)}
                      className="text-sm font-bold text-slate-800 hover:text-emerald-700 hover:underline mt-0.5 text-left block"
                    >
                      {f.customerName}
                    </button>
                  </div>
                  <Badge
                    variant={
                      f.priority === "High" ? "danger" : f.priority === "Medium" ? "warning" : "info"
                    }
                  >
                    {f.priority}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Row 3: Recent Activity & Recent Customers/Purchases */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Activity Timeline */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Recent Sales Activity</h2>
          <div className="relative pl-5 border-l border-slate-200 ml-2 space-y-5">
            {recentActivities.length === 0 ? (
              <div className="text-center py-6 text-sm text-slate-500 font-medium">
                No recent activity logged.
              </div>
            ) : (
              recentActivities.map((act) => (
                <div key={act.id} className="relative">
                  <span className="absolute -left-[28px] top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-100 border-2 border-white ring-1 ring-emerald-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-600"></span>
                  </span>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase">
                      {act.type} • {new Date(act.date).toLocaleDateString("en-IN")}
                    </p>
                    <p className="text-sm font-bold text-slate-855 mt-0.5">{act.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{act.description}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Customers */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4">My Recent Customers</h2>
          <div className="divide-y divide-slate-100">
            {recentCustomers.length === 0 ? (
              <div className="py-12 text-center text-sm text-slate-500 font-medium">
                No customers logged yet.
              </div>
            ) : (
              recentCustomers.map((c) => (
                <div key={c.id} className="py-3 flex items-center justify-between">
                  <div>
                    <button
                      onClick={() => onViewCustomer(c.full_name)}
                      className="text-sm font-bold text-slate-800 hover:text-emerald-700 hover:underline text-left block"
                    >
                      {c.full_name}
                    </button>
                    <span className="text-xs text-slate-400 block mt-0.5">
                      {c.customer_code} • {c.areaName}
                    </span>
                  </div>
                  <Badge variant={c.status === "Active" ? "success" : "danger"}>
                    {c.status}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Purchases */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4">My Recent Purchases</h2>
          <div className="divide-y divide-slate-100">
            {recentPurchases.length === 0 ? (
              <div className="py-12 text-center text-sm text-slate-500 font-medium">
                No purchases logged yet.
              </div>
            ) : (
              recentPurchases.map((p) => (
                <div key={p.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">
                      {p.customerName}
                    </p>
                    <span className="text-xs text-slate-400 block mt-0.5">
                      {p.purchase_code} • {new Date(p.purchase_date).toLocaleDateString("en-IN")}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900">
                        ₹{p.amount.toLocaleString("en-IN")}
                      </p>
                      <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">
                        +₹{p.incentive_amount} Inc
                      </span>
                    </div>

                    <div className="flex gap-1 shrink-0">
                      {onEditPurchase && (
                        <Button variant="secondary" onClick={() => onEditPurchase(p.id)} className="p-1.5 h-8 w-8 inline-flex items-center justify-center">
                          <Edit2 size={16} strokeWidth={2} className="text-amber-600 shrink-0" />
                        </Button>
                      )}
                      {onDeletePurchase && (
                        <Button
                          variant="secondary"
                          onClick={() => onDeletePurchase(p.id)}
                          disabled={deletingId === p.id}
                          className="p-1.5 h-8 w-8 inline-flex items-center justify-center"
                        >
                          <Trash2 size={16} strokeWidth={2} className="text-red-600 shrink-0" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
