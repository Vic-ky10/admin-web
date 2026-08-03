import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Bell,
  BriefcaseBusiness,
  CalendarCheck,
  CreditCard,
  Megaphone,
  UsersRound,
  ArrowRight,
  TrendingUp,
  Award,
  UserCheck,
} from "lucide-react";

import { getProjectDashboardStats } from "@/features/project/project.service";
import { adminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getAnnouncements } from "@/features/announcement/announcement.service";
import { getNotifications } from "@/features/notification/notification.service";
import { ANNOUNCEMENT_STATUS } from "@/features/announcement/announcement.types";
import NotificationList from "@/features/notification/components/NotificationList";

export const dynamic = "force-dynamic";

export interface AdminActivity {
  id: string;
  title: string;
  description: string;
  createdAt: string;
}

interface SupabaseLeaveActivityRecord {
  id: string;
  leave_type: string;
  status: string;
  total_days: number;
  created_at: string;
  employee: { full_name: string } | { full_name: string }[] | null;
}

interface SupabaseExpenseActivityRecord {
  id: string;
  description: string;
  amount: number;
  status: string;
  created_at: string;
  employee: { full_name: string } | { full_name: string }[] | null;
}

interface SupabaseIncentiveActivityRecord {
  id: string;
  title: string;
  amount: number;
  status: string;
  created_at: string;
  employee: { full_name: string } | { full_name: string }[] | null;
}

interface SupabaseAttendanceActivityRecord {
  id: string;
  status: string;
  created_at: string;
  employee: { full_name: string } | { full_name: string }[] | null;
}

export async function getAdminRecentActivity(): Promise<AdminActivity[]> {
  const leavesPromise = adminClient
    .from("leave_requests")
    .select(
      "id, leave_type, status, total_days, created_at, employee:profiles!leave_requests_profile_id_fkey(full_name)",
    )
    .order("created_at", { ascending: false })
    .limit(5);

  const expensesPromise = adminClient
    .from("expenses")
    .select(
      "id, description, amount, status, created_at, employee:profiles!expenses_profile_id_fkey(full_name)",
    )
    .order("created_at", { ascending: false })
    .limit(5);

  const incentivesPromise = adminClient
    .from("incentives")
    .select(
      "id, title, amount, status, created_at, employee:profiles!incentives_profile_id_fkey(full_name)",
    )
    .order("created_at", { ascending: false })
    .limit(5);

  const attendancePromise = adminClient
    .from("attendance")
    .select(
      "id, status, created_at, employee:profiles!attendance_profile_id_fkey(full_name)",
    )
    .order("created_at", { ascending: false })
    .limit(5);

  const [leavesRes, expensesRes, incentivesRes, attendanceRes] =
    await Promise.all([
      leavesPromise,
      expensesPromise,
      incentivesPromise,
      attendancePromise,
    ]);

  const activities: AdminActivity[] = [];

  const leavesData = (leavesRes.data ??
    []) as unknown as SupabaseLeaveActivityRecord[];
  leavesData.forEach((item) => {
    const emp = Array.isArray(item.employee) ? item.employee[0] : item.employee;
    const name = emp?.full_name ?? "Employee";
    activities.push({
      id: item.id,
      title: `${name} requested leave`,
      description: `${item.leave_type} (${item.total_days} days) - ${item.status}`,
      createdAt: item.created_at,
    });
  });

  const expensesData = (expensesRes.data ??
    []) as unknown as SupabaseExpenseActivityRecord[];
  expensesData.forEach((item) => {
    const emp = Array.isArray(item.employee) ? item.employee[0] : item.employee;
    const name = emp?.full_name ?? "Employee";
    activities.push({
      id: item.id,
      title: `${name} submitted expense`,
      description: `${item.description} (₹${item.amount}) - ${item.status}`,
      createdAt: item.created_at,
    });
  });

  const incentivesData = (incentivesRes.data ??
    []) as unknown as SupabaseIncentiveActivityRecord[];
  incentivesData.forEach((item) => {
    const emp = Array.isArray(item.employee) ? item.employee[0] : item.employee;
    const name = emp?.full_name ?? "Employee";
    activities.push({
      id: item.id,
      title: `${name} assigned incentive`,
      description: `${item.title} (₹${item.amount}) - ${item.status}`,
      createdAt: item.created_at,
    });
  });

  const attendanceData = (attendanceRes.data ??
    []) as unknown as SupabaseAttendanceActivityRecord[];
  attendanceData.forEach((item) => {
    const emp = Array.isArray(item.employee) ? item.employee[0] : item.employee;
    const name = emp?.full_name ?? "Employee";
    activities.push({
      id: item.id,
      title: `${name} Attendance Status`,
      description: `Attendance status marked as ${item.status}`,
      createdAt: item.created_at,
    });
  });

  return activities
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 5);
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [
    employeeCount,
    pendingLeaveCount,
    pendingExpenseCount,
    projectStats,
    adminProfile,
    activities,
    announcements,
    notifications,
    pendingLeavesReview,
    pendingExpensesReview,
    approvedPurchasesRes,
  ] = await Promise.all([
    adminClient.from("profiles").select("id", { count: "exact", head: true }),
    adminClient
      .from("leave_requests")
      .select("id", { count: "exact", head: true })
      .eq("status", "Pending"),
    adminClient
      .from("expenses")
      .select("id", { count: "exact", head: true })
      .eq("status", "Pending"),
    getProjectDashboardStats(),
    adminClient
      .from("profiles")
      .select("full_name, designation, department")
      .eq("id", user.id)
      .maybeSingle(),
    getAdminRecentActivity(),
    getAnnouncements(),
    getNotifications(user.id),
    adminClient
      .from("leave_requests")
      .select(
        "id, leave_type, total_days, created_at, employee:profiles!leave_requests_profile_id_fkey(full_name)",
      )
      .eq("status", "Pending")
      .order("created_at", { ascending: false })
      .limit(3),
    adminClient
      .from("expenses")
      .select(
        "id, description, amount, created_at, employee:profiles!expenses_profile_id_fkey(full_name)",
      )
      .eq("status", "Pending")
      .order("created_at", { ascending: false })
      .limit(3),
    adminClient
      .from("customer_purchases")
      .select("amount, purchase_date")
      .eq("status", "Approved"),
  ]);

  for (const response of [
    employeeCount,
    pendingLeaveCount,
    pendingExpenseCount,
    adminProfile,
    pendingLeavesReview,
    pendingExpensesReview,
    approvedPurchasesRes,
  ]) {
    if (response && "error" in response && response.error) {
      console.error(response.error);
    }
  }

  const publishedAnnouncements = announcements
    .filter((ann) => ann.status === ANNOUNCEMENT_STATUS.PUBLISHED)
    .slice(0, 3);

  const recentNotifications = notifications.slice(0, 5);

  // Process monthly sales revenue data (last 6 months)
  const approvedPurchases = approvedPurchasesRes.data || [];
  const monthlyRevenueData: { [key: string]: number } = {};
  
  // Initialize last 6 months chronologically
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setDate(1); // Prevent month overflow
    d.setMonth(d.getMonth() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthlyRevenueData[key] = 0;
  }

  approvedPurchases.forEach((p) => {
    const purchase = p as { amount: number; purchase_date: string };
    const date = new Date(purchase.purchase_date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    if (monthlyRevenueData[key] !== undefined) {
      monthlyRevenueData[key] += purchase.amount;
    }
  });

  const chartData = Object.entries(monthlyRevenueData).map(([key, val]) => {
    const [year, month] = key.split("-");
    const label = new Date(Number(year), Number(month) - 1, 1).toLocaleDateString("en-US", {
      month: "short",
    });
    return { label, amount: val };
  });

  const maxChartAmount = Math.max(...chartData.map((d) => d.amount), 10000);

  return (
    <div className="space-y-8">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white p-6 md:p-8 shadow-sm">
        {/* Subtle background gradient hints */}
        <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-blue-50/40 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-8 h-48 w-48 rounded-full bg-indigo-50/30 blur-3xl pointer-events-none" />
        
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-100/50">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />
              Overview Portal
            </span>
            <h1 className="mt-3 text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
              Welcome back, {adminProfile?.data?.full_name?.split(" ")[0] || "Admin"}
            </h1>
            <p className="mt-1.5 text-xs md:text-sm text-slate-505 max-w-2xl leading-relaxed">
              Logged in as <span className="font-semibold text-slate-750">{adminProfile?.data?.full_name || user.email}</span>. 
              Role: <span className="font-medium text-slate-655">{adminProfile?.data?.designation || "Administrator"}</span> &bull; 
              Dept: <span className="font-medium text-slate-655">{adminProfile?.data?.department || "Admin"}</span>
            </p>
          </div>
          <div className="shrink-0 flex flex-col items-start md:items-end gap-1 text-xs font-medium text-slate-400">
            <span className="text-slate-705 font-bold text-xs md:text-sm">
              {new Date().toLocaleDateString("en-IN", {
                weekday: "long",
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
            <span className="flex items-center gap-1">System Status: <span className="text-emerald-600 font-semibold flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />Online</span></span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardCard
          label="Total Employees"
          value={employeeCount.count ?? 0}
          href="/employees"
          icon={<UsersRound className="h-5 w-5" />}
          theme="blue"
        />
        <DashboardCard
          label="Active Projects"
          value={projectStats.activeProjects}
          href="/projects"
          icon={<BriefcaseBusiness className="h-5 w-5" />}
          theme="indigo"
        />
        <DashboardCard
          label="Pending Leaves"
          value={pendingLeaveCount.count ?? 0}
          href="/leave?status=Pending"
          icon={<CalendarCheck className="h-5 w-5" />}
          theme="rose"
        />
        <DashboardCard
          label="Pending Expenses"
          value={pendingExpenseCount.count ?? 0}
          href="/expenses?status=Pending"
          icon={<CreditCard className="h-5 w-5" />}
          theme="amber"
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions Grid */}
          <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm">
            <div>
              <h2 className="text-base font-bold tracking-tight text-slate-900">
                Quick Actions
              </h2>
              <p className="text-xs font-medium text-slate-500 mt-1">Frequently accessed administrative operations</p>
            </div>
            
            <div className="mt-5 grid gap-4 grid-cols-2 sm:grid-cols-4">
              <Link
                href="/projects"
                className="group flex flex-col items-center justify-center p-5 border border-slate-100 rounded-xl hover:border-blue-200 hover:bg-blue-50/10 transition-all duration-300 text-center"
              >
                <span className="p-2.5 rounded-xl bg-blue-50 text-blue-600 transition-transform group-hover:scale-110 group-hover:bg-blue-100">
                  <BriefcaseBusiness className="h-5 w-5" />
                </span>
                <span className="mt-3 text-sm font-bold text-slate-800 group-hover:text-blue-700 transition-colors">
                  Manage Projects
                </span>
                <span className="mt-1 text-[11px] font-medium text-slate-500 hidden sm:block">Track and edit details</span>
              </Link>
              
              <Link
                href="/employees"
                className="group flex flex-col items-center justify-center p-5 border border-slate-100 rounded-xl hover:border-indigo-200 hover:bg-indigo-50/10 transition-all duration-300 text-center"
              >
                <span className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 transition-transform group-hover:scale-110 group-hover:bg-indigo-100">
                  <UsersRound className="h-5 w-5" />
                </span>
                <span className="mt-3 text-sm font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">
                  Manage Staff
                </span>
                <span className="mt-1 text-[11px] font-medium text-slate-500 hidden sm:block">Profiles and access</span>
              </Link>
              
              <Link
                href="/leave?status=Pending"
                className="group flex flex-col items-center justify-center p-5 border border-slate-100 rounded-xl hover:border-rose-200 hover:bg-rose-50/10 transition-all duration-300 text-center"
              >
                <span className="p-2.5 rounded-xl bg-rose-50 text-rose-600 transition-transform group-hover:scale-110 group-hover:bg-rose-100">
                  <CalendarCheck className="h-5 w-5" />
                </span>
                <span className="mt-3 text-sm font-bold text-slate-800 group-hover:text-rose-700 transition-colors">
                  Review Leaves
                </span>
                <span className="mt-1 text-[11px] font-medium text-slate-500 hidden sm:block">Approve time-off requests</span>
              </Link>
              
              <Link
                href="/expenses?status=Pending"
                className="group flex flex-col items-center justify-center p-5 border border-slate-100 rounded-xl hover:border-amber-200 hover:bg-amber-50/10 transition-all duration-300 text-center"
              >
                <span className="p-2.5 rounded-xl bg-amber-50 text-amber-600 transition-transform group-hover:scale-110 group-hover:bg-amber-100">
                  <CreditCard className="h-5 w-5" />
                </span>
                <span className="mt-3 text-sm font-bold text-slate-800 group-hover:text-amber-700 transition-colors">
                  Review Expenses
                </span>
                <span className="mt-1 text-[11px] font-medium text-slate-500 hidden sm:block">Validate claims and bills</span>
              </Link>
            </div>
          </div>

          {/* Monthly Revenue Chart */}
          <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold tracking-tight text-slate-900 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Monthly Sales Revenue
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Approved customer purchase revenue generated over the last 6 months</p>
              </div>
              <Link
                href="/sales"
                className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-bold group"
              >
                View Sales Portal <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
            
            {/* Chart Area with Grid Lines */}
            <div className="relative mt-8 h-64">
              {/* Background Guidelines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[9px] font-bold text-slate-300">
                <div className="w-full border-t border-dashed border-slate-100/70 pt-1 flex justify-between">
                  <span>₹{maxChartAmount.toLocaleString("en-IN")}</span>
                  <span className="w-full h-0 border-t border-dashed border-slate-100/50 ml-2" />
                </div>
                <div className="w-full border-t border-dashed border-slate-100/70 pt-1 flex justify-between">
                  <span>₹{Math.round(maxChartAmount / 2).toLocaleString("en-IN")}</span>
                  <span className="w-full h-0 border-t border-dashed border-slate-100/50 ml-2" />
                </div>
                <div className="w-full border-t border-slate-100/75 pt-1" />
              </div>

              {/* Chart Bars */}
              <div className="absolute inset-0 flex items-end justify-between gap-4 pb-2 z-10">
                {chartData.map((data, idx) => {
                  const heightPercent = (data.amount / maxChartAmount) * 100;
                  return (
                    <div key={idx} className="group relative flex h-full flex-1 flex-col items-center justify-end">
                      {/* Premium Tooltip */}
                      <div className="absolute -top-12 scale-0 rounded-lg bg-slate-900 px-2.5 py-1.5 text-[11px] text-white transition-all duration-200 group-hover:scale-100 shadow-xl font-bold whitespace-nowrap z-30">
                        ₹{data.amount.toLocaleString("en-IN")}
                        <span className="absolute left-1/2 bottom-[-4px] h-2 w-2 -translate-x-1/2 rotate-45 bg-slate-900" />
                      </div>
                      
                      {/* Visual Bar */}  
                      <div
                        className="w-full max-w-[56px] rounded-t-xl bg-gradient-to-t from-blue-600 via-indigo-500 to-indigo-400 hover:from-blue-700 hover:via-indigo-600 hover:to-indigo-500 transition-all duration-500 hover:shadow-lg hover:shadow-indigo-100 cursor-pointer"
                        style={{ height: `${Math.max(heightPercent, 3)}%` }}
                      />
                      <span className="mt-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider group-hover:text-slate-600 transition-colors">
                        {data.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {/* Leave Approvals */}
            <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm flex flex-col">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold tracking-tight text-slate-900">
                    Pending Leaves
                  </h3>
                  <p className="text-xs font-medium text-slate-500 mt-1">Requires administrative review</p>
                </div>
                <Link
                  href="/leave?status=Pending"
                  className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-semibold group"
                >
                  Review All <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>

              <div className="mt-4 divide-y divide-slate-100/60 flex-1">
                {(pendingLeavesReview.data ?? []).length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center h-full">
                    <span className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">✓</span>
                    <p className="text-xs text-slate-400 mt-2">No pending leave requests</p>
                  </div>
                ) : (
                  (
                    (pendingLeavesReview.data ??
                      []) as unknown as SupabaseLeaveActivityRecord[]
                  ).map((l) => {
                    const emp = Array.isArray(l.employee) ? l.employee[0] : l.employee;
                    const name = emp?.full_name || "Employee";
                    const initials = name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
                    return (
                      <div key={l.id} className="py-3 flex items-center justify-between gap-3 group">
                        <div className="flex items-center gap-3">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-[11px] font-bold text-rose-700 ring-1 ring-rose-100/50">
                            {initials}
                          </span>
                          <div>
                            <p className="text-xs font-bold text-slate-800 group-hover:text-slate-955 transition-colors">
                              {name}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              {l.leave_type} request
                            </p>
                          </div>
                        </div>
                        <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-700 ring-1 ring-rose-100/30">
                          {l.total_days} {l.total_days === 1 ? "day" : "days"}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Expense Approvals */}
            <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm flex flex-col">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold tracking-tight text-slate-905">
                    Pending Expenses
                  </h3>
                  <p className="text-xs font-medium text-slate-500 mt-1">Awaiting expense validation</p>
                </div>
                <Link
                  href="/expenses?status=Pending"
                  className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-semibold group"
                >
                  Review All <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>

              <div className="mt-4 divide-y divide-slate-100/60 flex-1">
                {(pendingExpensesReview.data ?? []).length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center h-full">
                    <span className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">✓</span>
                    <p className="text-xs text-slate-400 mt-2">No pending expense claims</p>
                  </div>
                ) : (
                  (
                    (pendingExpensesReview.data ??
                      []) as unknown as SupabaseExpenseActivityRecord[]
                  ).map((e) => {
                    const emp = Array.isArray(e.employee) ? e.employee[0] : e.employee;
                    const name = emp?.full_name || "Employee";
                    const initials = name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
                    return (
                      <div key={e.id} className="py-3 flex items-center justify-between gap-3 group">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-[11px] font-bold text-amber-700 ring-1 ring-amber-100/50">
                            {initials}
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-805 group-hover:text-slate-955 transition-colors truncate">
                              {name}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[120px] md:max-w-[150px]">
                              {e.description}
                            </p>
                          </div>
                        </div>
                        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 ring-1 ring-amber-100/30 whitespace-nowrap">
                          ₹{e.amount.toLocaleString("en-IN")}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Recent Activity Timeline Widget */}
          <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm">
            <div>
              <h2 className="text-base font-bold tracking-tight text-slate-900">
                Recent Activity
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Logs of recent updates and actions across the workspace</p>
            </div>

            <div className="mt-6 relative pl-6 border-l-2 border-slate-100 space-y-6">
              {activities.length === 0 ? (
                <p className="py-6 text-center text-xs text-slate-400">
                  No recent activity.
                </p>
              ) : (
                activities.map((act) => {
                  let IconComponent = Bell;
                  let colorClass = "bg-blue-50 text-blue-600 ring-blue-100";
                  
                  const titleLower = act.title.toLowerCase();
                  const descLower = act.description.toLowerCase();
                  
                  if (titleLower.includes("leave") || descLower.includes("leave")) {
                    IconComponent = CalendarCheck;
                    colorClass = "bg-rose-50 text-rose-600 ring-rose-100";
                  } else if (titleLower.includes("expense") || descLower.includes("expense")) {
                    IconComponent = CreditCard;
                    colorClass = "bg-amber-50 text-amber-600 ring-amber-100";
                  } else if (titleLower.includes("incentive") || descLower.includes("incentive")) {
                    IconComponent = Award;
                    colorClass = "bg-purple-50 text-purple-600 ring-purple-100";
                  } else if (titleLower.includes("attendance") || descLower.includes("attendance")) {
                    IconComponent = UserCheck;
                    colorClass = "bg-teal-50 text-teal-600 ring-teal-100";
                  }

                  return (
                    <div key={act.id} className="relative group">
                      {/* Timeline Node Icon */}
                      <span className="absolute -left-[35px] top-0 flex h-7 w-7 items-center justify-center rounded-full bg-white ring-4 ring-white transition-transform group-hover:scale-110">
                        <span className={["flex h-6 w-6 items-center justify-center rounded-full ring-1", colorClass].join(" ")}>
                          <IconComponent className="h-3 w-3" />
                        </span>
                      </span>

                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-800 group-hover:text-blue-700 transition-colors">
                            {act.title}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-505 leading-relaxed max-w-xl">
                            {act.description}
                          </p>
                        </div>

                        <span className="shrink-0 self-start text-[9px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full ring-1 ring-slate-100/50">
                          {new Date(act.createdAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true
                          })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Announcements Widget */}
          <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="flex items-center gap-2 text-base font-bold tracking-tight text-slate-900">
                <Megaphone className="h-4.5 w-4.5 text-blue-600" />
                Announcements
              </h2>
              <Link
                href="/announcements"
                className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-semibold group"
              >
                View All <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            <div className="mt-5 space-y-4">
              {publishedAnnouncements.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <span className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">📢</span>
                  <p className="text-xs text-slate-400 mt-2">No active announcements</p>
                </div>
              ) : (
                publishedAnnouncements.map((ann) => (
                  <div
                    key={ann.id}
                    className="group relative overflow-hidden rounded-xl border border-slate-100 bg-white p-4 transition-all duration-300 hover:border-blue-100 hover:bg-blue-50/5 hover:shadow-sm"
                  >
                    <Link
                      href="/announcements"
                      className="block text-xs md:text-sm font-bold text-slate-800 transition-colors group-hover:text-blue-700 leading-snug"
                    >
                      {ann.title}
                    </Link>

                    <p className="mt-1.5 line-clamp-2 text-xs text-slate-500 leading-relaxed">
                      {ann.message}
                    </p>

                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-[10px] font-medium text-slate-400">
                        {new Date(ann.created_at).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>

                      <span className="rounded-full bg-slate-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-505 ring-1 ring-slate-100">
                        Official
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Notifications Widget */}
          <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Notifications
                </h2>
                <p className="mt-0.5 text-xs text-slate-400">
                  Stay updated with system alerts
                </p>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 ring-1 ring-blue-100/50">
                <Bell className="h-4.5 w-4.5 animate-pulse-slow" />
              </div>
            </div>

            <NotificationList
              notifications={recentNotifications}
              theme="blue"
              compact
              showViewAll
              viewAllHref="/notifications"
              cardHref="/notifications"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardCard({
  label,
  value,
  href,
  icon,
  theme = "blue",
}: {
  label: string;
  value: React.ReactNode;
  href: string;
  icon: React.ReactNode;
  theme?: "blue" | "indigo" | "rose" | "amber" | "emerald";
}) {
  const styles = {
    blue: {
      iconBg: "bg-blue-50 text-blue-700 ring-blue-100/60",
      hover: "hover:border-blue-200 hover:shadow-blue-50/55",
      indicator: "bg-blue-600",
    },
    indigo: {
      iconBg: "bg-indigo-50 text-indigo-700 ring-indigo-100/60",
      hover: "hover:border-indigo-200 hover:shadow-indigo-50/55",
      indicator: "bg-indigo-600",
    },
    rose: {
      iconBg: "bg-rose-50 text-rose-700 ring-rose-100/60",
      hover: "hover:border-rose-200 hover:shadow-rose-50/55",
      indicator: "bg-rose-600",
    },
    amber: {
      iconBg: "bg-amber-50 text-amber-700 ring-amber-100/60",
      hover: "hover:border-amber-200 hover:shadow-amber-50/55",
      indicator: "bg-amber-600",
    },
    emerald: {
      iconBg: "bg-emerald-50 text-emerald-700 ring-emerald-100/60",
      hover: "hover:border-emerald-200 hover:shadow-emerald-50/55",
      indicator: "bg-emerald-600",
    },
  };

  const themeStyle = styles[theme];

  return (
    <Link
      href={href}
      className={[
        "group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
        themeStyle.hover,
      ].join(" ")}
    >
      <span className={["absolute top-0 left-0 right-0 h-1", themeStyle.indicator].join(" ")} />
      
      <div className="flex items-center justify-between">
        <span className={["inline-flex h-10 w-10 items-center justify-center rounded-xl ring-1 transition-transform group-hover:scale-110", themeStyle.iconBg].join(" ")}>
          {icon}
        </span>
        <span className="text-slate-300 transition-transform group-hover:translate-x-1 duration-300">
          <ArrowRight className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-5 text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-1 text-3xl font-extrabold tracking-tight text-slate-800">
        {value}
      </p>
    </Link>
  );
}
