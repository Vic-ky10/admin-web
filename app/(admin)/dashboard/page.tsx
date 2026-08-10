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
  ShieldCheck,
  ChevronRight,
  Activity,
  CheckSquare2,
  Target,
} from "lucide-react";

import { getProjectDashboardStats } from "@/features/project/project.service";
import { adminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getAnnouncements } from "@/features/announcement/announcement.service";
import { getNotifications } from "@/features/notification/notification.service";
import { ANNOUNCEMENT_STATUS } from "@/features/announcement/announcement.types";
import NotificationList from "@/features/notification/components/NotificationList";
import { getAdminExpenseSummary } from "@/features/expense/expense.service";
import { MonthlyOverview } from "@/features/expense/components/analytics/MonthlyOverview";
import { getTodayDate } from "@/features/attendance/attendance.utils";

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

interface DeadlineProject {
  id: string;
  project_name: string;
  project_code: string;
  end_date: string;
  status: string;
  priority: string;
}

export async function getAdminRecentActivity(): Promise<AdminActivity[]> {
  const leavesPromise = adminClient
    .from("leave_requests")
    .select(
      "id, leave_type, status, total_days, created_at, employee:profiles!leave_requests_profile_id_fkey(full_name)"
    )
    .order("created_at", { ascending: false })
    .limit(5);

  const expensesPromise = adminClient
    .from("expenses")
    .select(
      "id, description, amount, status, created_at, employee:profiles!expenses_profile_id_fkey(full_name)"
    )
    .order("created_at", { ascending: false })
    .limit(5);

  const incentivesPromise = adminClient
    .from("incentives")
    .select(
      "id, title, amount, status, created_at, employee:profiles!incentives_profile_id_fkey(full_name)"
    )
    .order("created_at", { ascending: false })
    .limit(5);

  const attendancePromise = adminClient
    .from("attendance")
    .select(
      "id, status, created_at, employee:profiles!attendance_profile_id_fkey(full_name)"
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
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
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

  const today = getTodayDate();
  const thirtyDaysLater = new Date();
  thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);
  const thirtyDaysFromNowStr = thirtyDaysLater.toISOString().split("T")[0];

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
    expenseSummary,
    todayPresentCount,
    todayAbsentCount,
    upcomingDeadlines,
    openTaskCount,
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
      .select("full_name, designation, department, avatar_url")
      .eq("id", user.id)
      .maybeSingle(),
    getAdminRecentActivity(),
    getAnnouncements(),
    getNotifications(user.id),
    adminClient
      .from("leave_requests")
      .select(
        "id, leave_type, total_days, created_at, employee:profiles!leave_requests_profile_id_fkey(full_name)"
      )
      .eq("status", "Pending")
      .order("created_at", { ascending: false })
      .limit(3),
    adminClient
      .from("expenses")
      .select(
        "id, description, amount, created_at, employee:profiles!expenses_profile_id_fkey(full_name)"
      )
      .eq("status", "Pending")
      .order("created_at", { ascending: false })
      .limit(3),
    adminClient
      .from("customer_purchases")
      .select("amount, purchase_date")
      .eq("status", "Approved"),
    getAdminExpenseSummary().catch(() => null),
    // NEW: Today's attendance presence
    adminClient
      .from("attendance")
      .select("id", { count: "exact", head: true })
      .eq("attendance_date", today)
      .eq("status", "Present"),
    adminClient
      .from("attendance")
      .select("id", { count: "exact", head: true })
      .eq("attendance_date", today)
      .eq("status", "Absent"),
    // NEW: Upcoming project deadlines (next 30 days)
    adminClient
      .from("projects")
      .select("id, project_name, project_code, end_date, status, priority")
      .eq("status", "Active")
      .gte("end_date", today)
      .lte("end_date", thirtyDaysFromNowStr)
      .order("end_date", { ascending: true })
      .limit(4),
    // NEW: Open task count
    adminClient
      .from("tasks")
      .select("id", { count: "exact", head: true })
      .in("status", ["Todo", "In Progress", "In Review"]),
  ]);

  for (const response of [
    employeeCount,
    pendingLeaveCount,
    pendingExpenseCount,
    adminProfile,
    pendingLeavesReview,
    pendingExpensesReview,
    approvedPurchasesRes,
    todayPresentCount,
    todayAbsentCount,
    upcomingDeadlines,
    openTaskCount,
  ]) {
    if (response && "error" in response && response.error) {
      console.error(response.error);
    }
  }

  const publishedAnnouncements = announcements
    .filter((ann) => ann.status === ANNOUNCEMENT_STATUS.PUBLISHED)
    .slice(0, 3);

  const recentNotifications = notifications.slice(0, 5);
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  // Process monthly sales revenue data (last 6 months)
  const approvedPurchases = approvedPurchasesRes.data || [];
  const monthlyRevenueData: { [key: string]: number } = {};

  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setDate(1);
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
    const label = new Date(Number(year), Number(month) - 1, 1).toLocaleDateString(
      "en-US",
      { month: "short" }
    );
    return { label, amount: val };
  });

  const maxChartAmount = Math.max(...chartData.map((d) => d.amount), 10000);
  const fullName = adminProfile?.data?.full_name || "Admin";
  const firstName = fullName.split(" ")[0];
  const initials = fullName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const deadlines = (upcomingDeadlines.data ?? []) as DeadlineProject[];

  const todayFormatted = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="space-y-6 max-w-[1920px] mx-auto animate-fade-in">
      {/* 1. Profile Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 md:p-6 shadow-xs">
        <div className="absolute -top-12 -right-12 h-36 w-36 rounded-full bg-blue-50/50 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-8 h-40 w-40 rounded-full bg-indigo-50/40 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            {adminProfile?.data?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={adminProfile.data.avatar_url}
                alt={fullName}
                className="h-24 w-24 rounded-2xl object-cover ring-2 ring-blue-100 shrink-0 shadow-xs"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-blue-600 text-lg font-bold text-white shadow-xs shrink-0">
                {initials}
              </div>
            )}

            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-blue-700 ring-1 ring-blue-100/60">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />
                  Admin Web
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500">
                  <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
                  {adminProfile?.data?.designation || "Administrator"}
                </span>
              </div>

              <h1 className="mt-1 text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
                Welcome back, {firstName}
              </h1>

              <p className="text-sm text-slate-600 mt-0.5">
                Dept:{" "}
                <span className="font-semibold text-slate-800">
                  {adminProfile?.data?.department || "Executive"}
                </span>{" "}
                &bull; Email:{" "}
                <span className="font-medium text-slate-700">{user.email}</span>
              </p>
            </div>
          </div>

          <div className="shrink-0 flex flex-col items-start md:items-end gap-1 text-xs font-medium text-slate-500 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
            <span className="text-slate-800 font-bold text-xs md:text-sm">
              {todayFormatted}
            </span>
            <span className="flex items-center gap-1 text-slate-500 text-xs">
              System Status:{" "}
              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                Online
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. Overview Statistics Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardStatCard
          label="Total Employees"
          value={employeeCount.count ?? 0}
          href="/employees"
          icon={<UsersRound className="h-5 w-5" />}
          theme="blue"
        />
        <DashboardStatCard
          label="Active Projects"
          value={projectStats.activeProjects}
          href="/projects"
          icon={<BriefcaseBusiness className="h-5 w-5" />}
          theme="indigo"
        />
        <DashboardStatCard
          label="Pending Leaves"
          value={pendingLeaveCount.count ?? 0}
          href="/leave?status=Pending"
          icon={<CalendarCheck className="h-5 w-5" />}
          theme="rose"
        />
        <DashboardStatCard
          label="Pending Expenses"
          value={pendingExpenseCount.count ?? 0}
          href="/expenses?status=Pending"
          icon={<CreditCard className="h-5 w-5" />}
          theme="amber"
        />
      </div>

      {/* 3. Today's Overview Strip */}
     <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
  {/* Header */}
  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">
        Today&apos;s Workforce Overview
      </p>
      <h3 className="mt-1 text-2xl font-bold text-slate-900">
        {todayFormatted}
      </h3>
      <p className="mt-1 text-sm text-slate-500">
        Quick summary of today&apos;s organization activity
      </p>
    </div>
  </div>

  {/* Statistics */}
  <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">

    <Link href="/attendance">
      <div className="cursor-pointer rounded-2xl border border-emerald-200 bg-emerald-50 p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
        <TodayStatPill
          label="Present"
          value={todayPresentCount.count ?? 0}
          icon={<UserCheck className="h-5 w-5" />}
          color="emerald"
        />
      </div>
    </Link>

    <Link href="/attendance">
      <div className="cursor-pointer rounded-2xl border border-rose-200 bg-rose-50 p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
        <TodayStatPill
          label="Absent"
          value={todayAbsentCount.count ?? 0}
          icon={<UsersRound className="h-5 w-5" />}
          color="rose"
        />
      </div>
    </Link>

    <Link href="/leave">
      <div className="cursor-pointer rounded-2xl border border-amber-200 bg-amber-50 p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
        <TodayStatPill
          label="Pending Leaves"
          value={pendingLeaveCount.count ?? 0}
          icon={<CalendarCheck className="h-5 w-5" />}
          color="amber"
        />
      </div>
    </Link>

    <Link href="/expenses">
      <div className="cursor-pointer rounded-2xl border border-blue-200 bg-blue-50 p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
        <TodayStatPill
          label="Pending Expenses"
          value={pendingExpenseCount.count ?? 0}
          icon={<CreditCard className="h-5 w-5" />}
          color="blue"
        />
      </div>
    </Link>

    <Link href="/tasks">
      <div className="cursor-pointer rounded-2xl border border-violet-200 bg-violet-50 p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
        <TodayStatPill
          label="Open Tasks"
          value={openTaskCount.count ?? 0}
          icon={<CheckSquare2 className="h-5 w-5" />}
          color="violet"
        />
      </div>
    </Link>

  </div>
</div>

      {/* 4. Main Content Layout */}
      <div className="grid gap-6 lg:grid-cols-3 items-start">
        <div className="lg:col-span-2 space-y-6">
          {/* Monthly Sales Revenue */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold tracking-tight text-slate-900 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Monthly Sales Revenue
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Approved customer purchase revenue generated over the last 6 months
                </p>
              </div>
              <Link
                href="/sales"
                className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-bold group"
              >
                Sales Portal{" "}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            {/* Chart Area */}
            <div className="relative mt-6 h-60">
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[9px] font-bold text-slate-300">
                <div className="w-full border-t border-dashed border-slate-100/80 pt-1 flex justify-between">
                  <span>₹{maxChartAmount.toLocaleString("en-IN")}</span>
                  <span className="w-full h-0 border-t border-dashed border-slate-100/50 ml-2" />
                </div>
                <div className="w-full border-t border-dashed border-slate-100/80 pt-1 flex justify-between">
                  <span>
                    ₹{Math.round(maxChartAmount / 2).toLocaleString("en-IN")}
                  </span>
                  <span className="w-full h-0 border-t border-dashed border-slate-100/50 ml-2" />
                </div>
                <div className="w-full border-t border-slate-100/90 pt-1" />
              </div>

              <div className="absolute inset-0 flex items-end justify-between gap-3 pb-2 z-10">
                {chartData.map((data, idx) => {
                  const heightPercent = (data.amount / maxChartAmount) * 100;
                  return (
                    <div
                      key={idx}
                      className="group relative flex h-full flex-1 flex-col items-center justify-end"
                    >
                      <div className="relative w-full flex justify-center">
                        <div className="absolute -top-10 scale-0 rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] text-white transition-all duration-200 group-hover:scale-100 shadow-xl font-bold whitespace-nowrap z-30">
                          ₹{data.amount.toLocaleString("en-IN")}
                          <span className="absolute left-1/2 bottom-[-4px] h-2 w-2 -translate-x-1/2 rotate-45 bg-slate-900" />
                        </div>
                      </div>

                      <div
                        className="w-full max-w-[48px] rounded-t-xl bg-gradient-to-t from-blue-600 to-indigo-500 hover:from-blue-700 hover:to-indigo-600 transition-all duration-300 hover:shadow-md cursor-pointer"
                        style={{ height: `${Math.max(heightPercent, 4)}%` }}
                      />
                      <span className="mt-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider group-hover:text-slate-700 transition-colors">
                        {data.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Monthly Expense Overview */}
          {expenseSummary?.monthlySummary && (
            <div className="[&>div]:rounded-2xl [&>div]:shadow-xs">
              <MonthlyOverview monthlySummary={expenseSummary.monthlySummary} />
            </div>
          )}

          {/* Quick Management Grid */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-slate-900">
                Quick Management
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Frequently accessed administrative controls
              </p>
            </div>

            <div className="mt-4 grid gap-3 grid-cols-2 sm:grid-cols-4">
              <QuickActionItem
                title="Projects"
                description="Manage active projects"
                href="/projects"
                icon={<BriefcaseBusiness className="h-4.5 w-4.5" />}
                color="blue"
              />
              <QuickActionItem
                title="Employees"
                description="Staff profiles & access"
                href="/employees"
                icon={<UsersRound className="h-4.5 w-4.5" />}
                color="indigo"
              />
              <QuickActionItem
                title="Leaves"
                description="Review time-off requests"
                href="/leave?status=Pending"
                icon={<CalendarCheck className="h-4.5 w-4.5" />}
                color="rose"
              />
              <QuickActionItem
                title="Expenses"
                description="Validate expense claims"
                href="/expenses?status=Pending"
                icon={<CreditCard className="h-4.5 w-4.5" />}
                color="amber"
              />
            </div>
          </div>

          {/* Upcoming Project Deadlines */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold tracking-tight text-slate-900 flex items-center gap-2">
                  <Target className="h-4.5 w-4.5 text-blue-600" />
                  Upcoming Project Deadlines
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Active projects due in the next 30 days
                </p>
              </div>
              <Link
                href="/projects"
                className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-bold group"
              >
                All Projects{" "}
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            <div className="mt-3 space-y-2">
              {deadlines.length === 0 ? (
                <div className="py-7 text-center">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-slate-400">
                    ✓
                  </span>
                  <p className="text-xs text-slate-500 mt-2">
                    No project deadlines in the next 30 days.
                  </p>
                </div>
              ) : (
                deadlines.map((project) => {
                  const daysLeft = Math.ceil(
                    (new Date(project.end_date).getTime() -
                      new Date().getTime()) /
                      (1000 * 60 * 60 * 24)
                  );
                  const urgency =
                    daysLeft <= 7
                      ? "rose"
                      : daysLeft <= 14
                        ? "amber"
                        : "blue";

                  return (
                    <div
                      key={project.id}
                      className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-3 hover:bg-white hover:border-slate-200 hover:shadow-xs transition-all duration-200 group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={[
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-black ring-1",
                            urgency === "rose"
                              ? "bg-rose-50 text-rose-700 ring-rose-100"
                              : urgency === "amber"
                                ? "bg-amber-50 text-amber-700 ring-amber-100"
                                : "bg-blue-50 text-blue-700 ring-blue-100",
                          ].join(" ")}
                        >
                          {daysLeft}d
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-800 truncate group-hover:text-blue-700 transition-colors">
                            {project.project_name}
                          </p>
                          <p className="text-[10px] text-slate-500 font-mono">
                            {project.project_code} &bull;{" "}
                            {new Date(project.end_date).toLocaleDateString(
                              "en-IN",
                              { day: "2-digit", month: "short" }
                            )}
                          </p>
                        </div>
                      </div>
                      <span
                        className={[
                          "shrink-0 ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full ring-1",
                          project.priority === "High"
                            ? "bg-rose-50 text-rose-700 ring-rose-100"
                            : project.priority === "Medium"
                              ? "bg-amber-50 text-amber-700 ring-amber-100"
                              : "bg-slate-50 text-slate-600 ring-slate-100",
                        ].join(" ")}
                      >
                        {project.priority}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Pending Reviews Row */}
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Pending Leaves */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex flex-col min-h-[220px]">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold tracking-tight text-slate-900">
                    Pending Leaves
                  </h3>
                  <p className="text-xs text-slate-600">Requires admin approval</p>
                </div>
                <Link
                  href="/leave?status=Pending"
                  className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-semibold group"
                >
                  Review{" "}
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>

              <div className="mt-3 divide-y divide-slate-100 flex-1">
                {(pendingLeavesReview.data ?? []).length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-6 text-center h-full">
                    <span className="h-7 w-7 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 text-xs">
                      ✓
                    </span>
                    <p className="text-xs text-slate-500 mt-1.5">
                      No pending leaves
                    </p>
                  </div>
                ) : (
                  (
                    (pendingLeavesReview.data ??
                      []) as unknown as SupabaseLeaveActivityRecord[]
                  ).map((l) => {
                    const emp = Array.isArray(l.employee)
                      ? l.employee[0]
                      : l.employee;
                    const name = emp?.full_name || "Employee";
                    const empInitials = name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .substring(0, 2);
                    return (
                      <div
                        key={l.id}
                        className="py-2.5 flex items-center justify-between gap-3 group"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-[10px] font-bold text-rose-700 ring-1 ring-rose-100/60">
                            {empInitials}
                          </span>
                          <div>
                            <p className="text-xs font-bold text-slate-800 group-hover:text-slate-950 transition-colors">
                              {name}
                            </p>
                            <p className="text-[10px] text-slate-500">
                              {l.leave_type} request
                            </p>
                          </div>
                        </div>
                        <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-700 ring-1 ring-rose-100/40">
                          {l.total_days} {l.total_days === 1 ? "day" : "days"}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Pending Expenses */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex flex-col min-h-[220px]">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold tracking-tight text-slate-900">
                    Pending Expenses
                  </h3>
                  <p className="text-xs text-slate-600">
                    Awaiting expense validation
                  </p>
                </div>
                <Link
                  href="/expenses?status=Pending"
                  className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-semibold group"
                >
                  Review{" "}
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>

              <div className="mt-3 divide-y divide-slate-100 flex-1">
                {(pendingExpensesReview.data ?? []).length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-6 text-center h-full">
                    <span className="h-7 w-7 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 text-xs">
                      ✓
                    </span>
                    <p className="text-xs text-slate-500 mt-1.5">
                      No pending expense claims
                    </p>
                  </div>
                ) : (
                  (
                    (pendingExpensesReview.data ??
                      []) as unknown as SupabaseExpenseActivityRecord[]
                  ).map((e) => {
                    const emp = Array.isArray(e.employee)
                      ? e.employee[0]
                      : e.employee;
                    const name = emp?.full_name || "Employee";
                    const empInitials = name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .substring(0, 2);
                    return (
                      <div
                        key={e.id}
                        className="py-2.5 flex items-center justify-between gap-3 group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-[10px] font-bold text-amber-700 ring-1 ring-amber-100/60">
                            {empInitials}
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-800 group-hover:text-slate-950 transition-colors truncate">
                              {name}
                            </p>
                            <p className="text-[10px] text-slate-500 truncate max-w-[120px]">
                              {e.description}
                            </p>
                          </div>
                        </div>
                        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 ring-1 ring-amber-100/40 whitespace-nowrap">
                          ₹{e.amount.toLocaleString("en-IN")}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar Column */}
        <div className="space-y-6">
          {/* System Snapshot */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold tracking-tight text-slate-900 flex items-center gap-2">
                <Activity className="h-4.5 w-4.5 text-blue-600" />
                System Snapshot
              </h2>
            </div>
            <div className="mt-4 space-y-1">
              <SnapshotRow
                icon={<UsersRound className="h-3.5 w-3.5 text-blue-600" />}
                label="Total Employees"
                value={String(employeeCount.count ?? 0)}
              />
              <SnapshotRow
                icon={
                  <BriefcaseBusiness className="h-3.5 w-3.5 text-indigo-600" />
                }
                label="Active Projects"
                value={String(projectStats.activeProjects)}
              />
              <SnapshotRow
                icon={
                  <CheckSquare2 className="h-3.5 w-3.5 text-violet-600" />
                }
                label="Open Tasks"
                value={String(openTaskCount.count ?? 0)}
              />
              <SnapshotRow
                icon={<CreditCard className="h-3.5 w-3.5 text-amber-600" />}
                label="Pending Expenses"
                value={String(pendingExpenseCount.count ?? 0)}
              />
              <SnapshotRow
                icon={
                  <CalendarCheck className="h-3.5 w-3.5 text-rose-600" />
                }
                label="Pending Leaves"
                value={String(pendingLeaveCount.count ?? 0)}
              />
              <SnapshotRow
                icon={<Megaphone className="h-3.5 w-3.5 text-emerald-600" />}
                label="Announcements"
                value={String(publishedAnnouncements.length)}
              />
            </div>
          </div>

          {/* Recent Activity Timeline */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <div>
              <h2 className="text-base font-bold tracking-tight text-slate-900">
                Recent Activity
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Live workspace update activity log
              </p>
            </div>

            <div className="mt-5 relative pl-5 border-l-2 border-slate-100 space-y-5">
              {activities.length === 0 ? (
                <p className="py-4 text-center text-xs text-slate-500">
                  No recent activity records.
                </p>
              ) : (
                activities.map((act) => {
                  let IconComponent = Bell;
                  let colorClass = "bg-blue-50 text-blue-600 ring-blue-100";

                  const titleLower = act.title.toLowerCase();
                  const descLower = act.description.toLowerCase();

                  if (
                    titleLower.includes("leave") ||
                    descLower.includes("leave")
                  ) {
                    IconComponent = CalendarCheck;
                    colorClass = "bg-rose-50 text-rose-600 ring-rose-100";
                  } else if (
                    titleLower.includes("expense") ||
                    descLower.includes("expense")
                  ) {
                    IconComponent = CreditCard;
                    colorClass = "bg-amber-50 text-amber-600 ring-amber-100";
                  } else if (
                    titleLower.includes("incentive") ||
                    descLower.includes("incentive")
                  ) {
                    IconComponent = Award;
                    colorClass =
                      "bg-purple-50 text-purple-600 ring-purple-100";
                  } else if (
                    titleLower.includes("attendance") ||
                    descLower.includes("attendance")
                  ) {
                    IconComponent = UserCheck;
                    colorClass = "bg-teal-50 text-teal-600 ring-teal-100";
                  }

                  return (
                    <div key={act.id} className="relative group">
                      <span className="absolute -left-[29px] top-0 flex h-6 w-6 items-center justify-center rounded-full bg-white ring-4 ring-white transition-transform group-hover:scale-110">
                        <span
                          className={[
                            "flex h-5 w-5 items-center justify-center rounded-full ring-1",
                            colorClass,
                          ].join(" ")}
                        >
                          <IconComponent className="h-2.5 w-2.5" />
                        </span>
                      </span>

                      <div className="flex flex-col gap-1">
                        <p className="text-sm font-bold text-slate-800 group-hover:text-blue-700 transition-colors leading-snug">
                          {act.title}
                        </p>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {act.description}
                        </p>
                        <span className="text-[10px] font-medium text-slate-400 self-start mt-0.5">
                          {new Date(act.createdAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Announcements Widget */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="flex items-center gap-2 text-base font-bold tracking-tight text-slate-900">
                <Megaphone className="h-4.5 w-4.5 text-blue-600" />
                Announcements
              </h2>
              <Link
                href="/announcements"
                className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-semibold group"
              >
                All{" "}
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {publishedAnnouncements.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <span className="h-7 w-7 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 text-xs">
                    📢
                  </span>
                  <p className="text-xs text-slate-500 mt-1.5">
                    No active announcements
                  </p>
                </div>
              ) : (
                publishedAnnouncements.map((ann) => (
                  <div
                    key={ann.id}
                    className="group relative rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 transition-all duration-200 hover:border-blue-200 hover:bg-white hover:shadow-xs"
                  >
                    <Link
                      href="/announcements"
                      className="block text-xs font-bold text-slate-800 transition-colors group-hover:text-blue-700 leading-snug"
                    >
                      {ann.title}
                    </Link>

                    <p className="mt-1 line-clamp-2 text-xs text-slate-600 leading-relaxed">
                      {ann.message}
                    </p>

                    <div className="mt-2.5 flex items-center justify-between">
                      <span className="text-[10px] font-medium text-slate-400">
                        {new Date(ann.created_at).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>

                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-600">
                        Official
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Notifications Widget */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <div className="mb-4 flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Notifications
                </h2>
                <p className="mt-0.5 text-xs text-slate-600">
                  System alerts and updates
                </p>
              </div>

              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[9px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 ring-1 ring-blue-100/60">
                  <Bell className="h-4 w-4" />
                </div>
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

// ─── Helper: Today Stat Pill ──────────────────────────────────────────────────
function TodayStatPill({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: "emerald" | "rose" | "amber" | "blue" | "violet";
}) {
  const colorMap = {
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100/80",
    rose: "bg-rose-50 text-rose-700 ring-rose-100/80",
    amber: "bg-amber-50 text-amber-700 ring-amber-100/80",
    blue: "bg-blue-50 text-blue-700 ring-blue-100/80",
    violet: "bg-violet-50 text-violet-700 ring-violet-100/80",
  };

  return (
    <div
      className={[
        "flex items-center gap-2.5 rounded-xl px-3 py-2 ring-1",
        colorMap[color],
      ].join(" ")}
    >
      {icon}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider opacity-70 leading-none">
          {label}
        </p>
        <p className="text-base font-black leading-tight mt-0.5">{value}</p>
      </div>
    </div>
  );
}

// ─── Helper: Snapshot Row ─────────────────────────────────────────────────────
function SnapshotRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
      <div className="flex items-center gap-2.5">
        <span className="shrink-0">{icon}</span>
        <span className="text-xs font-semibold text-slate-700">{label}</span>
      </div>
      <span className="text-sm font-black text-slate-900">{value}</span>
    </div>
  );
}

// ─── Dashboard Stat Card ──────────────────────────────────────────────────────
function DashboardStatCard({
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
  theme?: "blue" | "indigo" | "rose" | "amber";
}) {
  const themeStyles = {
    blue: {
      bg: "bg-blue-50 text-blue-700 ring-blue-100/60",
      hover: "hover:border-blue-300 hover:shadow-blue-50/50",
    },
    indigo: {
      bg: "bg-indigo-50 text-indigo-700 ring-indigo-100/60",
      hover: "hover:border-indigo-300 hover:shadow-indigo-50/50",
    },
    rose: {
      bg: "bg-rose-50 text-rose-700 ring-rose-100/60",
      hover: "hover:border-rose-300 hover:shadow-rose-50/50",
    },
    amber: {
      bg: "bg-amber-50 text-amber-700 ring-amber-100/60",
      hover: "hover:border-amber-300 hover:shadow-amber-50/50",
    },
  };

  const currentTheme = themeStyles[theme];

  return (
    <Link
      href={href}
      className={[
        "group flex flex-col justify-between h-full rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all duration-200",
        currentTheme.hover,
      ].join(" ")}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          {label}
        </span>
        <span
          className={[
            "flex h-9 w-9 items-center justify-center rounded-xl ring-1 transition-transform group-hover:scale-105",
            currentTheme.bg,
          ].join(" ")}
        >
          {icon}
        </span>
      </div>

      <div className="mt-4 flex items-baseline justify-between">
        <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {value}
        </span>
        <span className="flex items-center text-xs font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
          View <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
        </span>
      </div>
    </Link>
  );
}

// ─── Quick Action Item ────────────────────────────────────────────────────────
function QuickActionItem({
  title,
  description,
  href,
  icon,
  color,
}: {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  color: "blue" | "indigo" | "rose" | "amber";
}) {
  const colorMap = {
    blue: "bg-blue-50 text-blue-600 group-hover:bg-blue-100 group-hover:text-blue-700",
    indigo:
      "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100 group-hover:text-indigo-700",
    rose: "bg-rose-50 text-rose-600 group-hover:bg-rose-100 group-hover:text-rose-700",
    amber:
      "bg-amber-50 text-amber-600 group-hover:bg-amber-100 group-hover:text-amber-700",
  };

  return (
    <Link
      href={href}
      className="group flex flex-col p-4 rounded-xl border border-slate-100 bg-white hover:border-slate-300 hover:shadow-2xs transition-all duration-200"
    >
      <span
        className={[
          "p-2 rounded-xl w-fit transition-colors",
          colorMap[color],
        ].join(" ")}
      >
        {icon}
      </span>
      <span className="mt-2.5 text-sm font-bold text-slate-800 group-hover:text-blue-700 transition-colors">
        {title}
      </span>
      <span className="mt-0.5 text-xs font-medium text-slate-600 truncate">
        {description}
      </span>
    </Link>
  );
}
