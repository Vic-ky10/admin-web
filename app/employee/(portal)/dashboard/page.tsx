import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Bell,
  Calendar,
  CalendarCheck,
  Clock,
  CreditCard,
  Megaphone,
  Award,
  User,
  TrendingUp,
  ArrowRight,
  ChevronRight,
  CheckCircle2,
  BriefcaseBusiness,
  CheckSquare2,
} from "lucide-react";
import {
  getCurrentEmployeeProfile,
  getEmployeeDashboardStats,
  getEmployeeRecentActivity,
} from "@/features/employee-portal/employee-portal.service";
import { getAnnouncements } from "@/features/announcement/announcement.service";
import { getNotifications } from "@/features/notification/notification.service";
import { ANNOUNCEMENT_STATUS } from "@/features/announcement/announcement.types";
import NotificationList from "@/features/notification/components/NotificationList";
import { getEmployeeExpenseSummary } from "@/features/expense/expense.service";
import { MonthlyOverview } from "@/features/expense/components/analytics/MonthlyOverview";
import { adminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function EmployeeDashboardPage() {
  const profile = await getCurrentEmployeeProfile();

  if (!profile) {
    redirect("/employee/login");
  }

  const [
    stats,
    activities,
    announcements,
    notifications,
    expenseSummary,
    approvedPurchasesRes,
  ] = await Promise.all([
    getEmployeeDashboardStats(profile.id),
    getEmployeeRecentActivity(profile.id),
    getAnnouncements(),
    getNotifications(profile.id),
    getEmployeeExpenseSummary(profile.id).catch(() => null),
    adminClient
      .from("customer_purchases")
      .select("amount, purchase_date")
      .eq("profile_id", profile.id)
      .eq("status", "Approved"),
  ]);

  const publishedAnnouncements = announcements
    .filter((ann) => ann.status === ANNOUNCEMENT_STATUS.PUBLISHED)
    .slice(0, 3);

  const recentNotifications = notifications.slice(0, 5);
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  // Process employee monthly sales revenue data (last 6 months)
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

  const maxChartAmount = Math.max(...chartData.map((d) => d.amount), 5000);
  const firstName = profile.full_name.split(" ")[0];
  const initials = profile.full_name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const todayFormatted = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  // Calculate today's status
  const todayStatus = stats.todayAttendance?.status || "Not Marked";
  const todayHours = stats.todayAttendance?.working_hours || "-";

  return (
    <div className="space-y-6 max-w-[1920px] mx-auto animate-fade-in">
      {/* 1. Compact Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 md:p-6 shadow-xs">
        <div className="absolute -top-12 -right-12 h-36 w-36 rounded-full bg-emerald-50/50 blur-2xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            {profile.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatar_url}
                alt={profile.full_name}
                className="h-20 w-20 rounded-2xl object-cover ring-2 ring-emerald-100 shrink-0 shadow-xs"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-600 text-xl font-bold text-white shadow-xs shrink-0">
                {initials}
              </div>
            )}

            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-100/60">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  Employee Portal
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50/50 px-2 py-0.5 rounded-full border border-emerald-100">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  ID: {profile.employee_id}
                </span>
              </div>

              <h1 className="mt-1 text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
                Welcome back, {firstName}
              </h1>

              <p className="text-sm text-slate-600 mt-0.5">
                <span className="font-semibold text-slate-800">
                  {profile.designation}
                </span>{" "}
                &bull; Dept:{" "}
                <span className="font-medium text-slate-700">
                  {profile.department}
                </span>
              </p>
            </div>
          </div>

          <div className="shrink-0 flex flex-col items-start md:items-end gap-1 text-xs font-medium text-slate-500 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
            <span className="text-slate-800 font-bold text-xs md:text-sm">
              {todayFormatted}
            </span>
            <span className="flex items-center gap-1 text-slate-500 text-xs">
              Status:{" "}
              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Active
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. Statistic Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <EmployeeStatCard
          label="Leave Balance"
          value={`${stats.leaveBalance} Days`}
          href="/employee/leave"
          icon={<Calendar className="h-5 w-5" />}
          theme="emerald"
        />
        <EmployeeStatCard
          label="Pending Leaves"
          value={stats.pendingLeaveRequests}
          href="/employee/leave?status=Pending"
          icon={<CalendarCheck className="h-5 w-5" />}
          theme="amber"
        />
        <EmployeeStatCard
          label="Pending Expenses"
          value={stats.pendingExpenses}
          href="/employee/expenses"
          icon={<CreditCard className="h-5 w-5" />}
          theme="blue"
        />
        <EmployeeStatCard
          label="Pending Tasks"
          value={stats.pendingTasks}
          href="/employee/tasks"
          icon={<CheckSquare2 className="h-5 w-5" />}
          theme="purple"
        />
      </div>

      {/* 3. Today Summary strip  */}
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
  {/* Header */}
  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-600">
        Today&apos;s Summary
      </p>

      <h3 className="mt-1 text-2xl font-bold text-slate-900">
        {todayFormatted}
      </h3>

      <p className="mt-1 text-sm text-slate-500">
        Your work progress and daily activity overview.
      </p>
    </div>
  </div>

  {/* Summary Cards */}
  <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

    <Link href="/employee/attendance">
      <div className="cursor-pointer rounded-2xl border border-emerald-200 bg-emerald-50 p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
        <TodayStatPill
          label="Attendance Status"
          value={todayStatus}
          icon={<Clock className="h-5 w-5" />}
          color={
            todayStatus === "Present"
              ? "emerald"
              : todayStatus === "Absent"
              ? "rose"
              : "amber"
          }
        />
      </div>
    </Link>

    <Link href="/employee/attendance">
      <div className="cursor-pointer rounded-2xl border border-blue-200 bg-blue-50 p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
        <TodayStatPill
          label="Working Hours"
          value={todayHours !== "-" ? `${todayHours} hrs` : "-"}
          icon={<Clock className="h-5 w-5" />}
          color="blue"
        />
      </div>
    </Link>

    <Link href="/employee/tasks">
      <div className="cursor-pointer rounded-2xl border border-violet-200 bg-violet-50 p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
        <TodayStatPill
          label="Pending Tasks"
          value={String(stats.pendingTasks)}
          icon={<CheckSquare2 className="h-5 w-5" />}
          color="violet"
        />
      </div>
    </Link>

    <Link href="/employee/leave">
      <div className="cursor-pointer rounded-2xl border border-emerald-200 bg-emerald-50 p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
        <TodayStatPill
          label="Leave Balance"
          value={`${stats.leaveBalance} Days`}
          icon={<Calendar className="h-5 w-5" />}
          color="emerald"
        />
      </div>
    </Link>

  </div>
</div>

      {/* Main Grid Layout */}
      <div className="grid gap-6 lg:grid-cols-3 items-start">
        <div className="lg:col-span-2 space-y-6">
          {/* My Sales Revenue */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold tracking-tight text-slate-900 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                  My Sales Revenue
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Your approved personal sales revenue performance over 6 months
                </p>
              </div>
              <Link
                href="/employee/sales"
                className="text-xs text-emerald-600 hover:text-emerald-700 flex items-center gap-1 font-bold group"
              >
                My Sales{" "}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            <div className="relative mt-6 h-56">
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
                      <div className="absolute -top-10 scale-0 rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] text-white transition-all duration-200 group-hover:scale-100 shadow-xl font-bold whitespace-nowrap z-30">
                        ₹{data.amount.toLocaleString("en-IN")}
                        <span className="absolute left-1/2 bottom-[-4px] h-2 w-2 -translate-x-1/2 rotate-45 bg-slate-900" />
                      </div>

                      <div
                        className="w-full max-w-[48px] rounded-t-xl bg-gradient-to-t from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 transition-all duration-300 hover:shadow-md cursor-pointer"
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

          {/* Monthly Expense Overview (placed directly beneath Sales Revenue) */}
          {expenseSummary?.monthlySummary && (
            <div className="[&>div]:rounded-2xl [&>div]:shadow-xs">
              <MonthlyOverview monthlySummary={expenseSummary.monthlySummary} />
            </div>
          )}

          {/* Quick Actions Grid */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <div>
              <h2 className="text-base font-bold tracking-tight text-slate-900">
                Quick Actions
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Commonly accessed employee portals
              </p>
            </div>

            <div className="mt-4 grid gap-3 grid-cols-2 sm:grid-cols-4">
              <Link
                href="/employee/leave"
                className="group flex flex-col p-4 rounded-xl border border-slate-100 bg-white hover:border-emerald-200 hover:bg-emerald-50/20 transition-all duration-200"
              >
                <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600 w-fit group-hover:bg-emerald-100">
                  <Calendar className="h-4.5 w-4.5" />
                </span>
                <span className="mt-2.5 text-sm font-bold text-slate-800 group-hover:text-emerald-700">
                  Apply Leave
                </span>
                <span className="mt-0.5 text-xs text-slate-600">Request time off</span>
              </Link>

              <Link
                href="/employee/expenses"
                className="group flex flex-col p-4 rounded-xl border border-slate-100 bg-white hover:border-emerald-200 hover:bg-emerald-50/20 transition-all duration-200"
              >
                <span className="p-2 rounded-xl bg-blue-50 text-blue-600 w-fit group-hover:bg-blue-100">
                  <CreditCard className="h-4.5 w-4.5" />
                </span>
                <span className="mt-2.5 text-sm font-bold text-slate-800 group-hover:text-blue-700">
                  Submit Expense
                </span>
                <span className="mt-0.5 text-xs text-slate-600">
                  Reimbursement claims
                </span>
              </Link>

              <Link
                href="/employee/tasks"
                className="group flex flex-col p-4 rounded-xl border border-slate-100 bg-white hover:border-emerald-200 hover:bg-emerald-50/20 transition-all duration-200"
              >
                <span className="p-2 rounded-xl bg-violet-50 text-violet-600 w-fit group-hover:bg-violet-100">
                  <Clock className="h-4.5 w-4.5" />
                </span>
                <span className="mt-2.5 text-sm font-bold text-slate-800 group-hover:text-violet-700">
                  My Tasks
                </span>
                <span className="mt-0.5 text-xs text-slate-600">
                  Track assigned work
                </span>
              </Link>

              <Link
                href="/employee/incentives"
                className="group flex flex-col p-4 rounded-xl border border-slate-100 bg-white hover:border-emerald-200 hover:bg-emerald-50/20 transition-all duration-200"
              >
                <span className="p-2 rounded-xl bg-amber-50 text-amber-600 w-fit group-hover:bg-amber-100">
                  <Award className="h-4.5 w-4.5" />
                </span>
                <span className="mt-2.5 text-sm font-bold text-slate-800 group-hover:text-amber-700">
                  Incentives
                </span>
                <span className="mt-0.5 text-xs text-slate-600">
                  View bonus claims
                </span>
              </Link>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <div>
              <h2 className="text-base font-bold tracking-tight text-slate-900">
                Recent Activity
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">Your latest update log</p>
            </div>

            <div className="mt-4 space-y-3">
              {activities.length === 0 ? (
                <p className="py-4 text-center text-xs text-slate-500">
                  No recent activity recorded.
                </p>
              ) : (
                activities.map((act) => (
                  <div
                    key={act.id}
                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 transition-all hover:bg-white hover:border-emerald-200 hover:shadow-2xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-xs font-bold text-emerald-800 shrink-0">
                        {act.title.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-800 leading-snug">
                          {act.title}
                        </h3>
                        <p className="text-xs text-slate-600 mt-0.5">
                          {act.description}
                        </p>
                      </div>
                    </div>

                    <span className="text-[10px] font-semibold text-slate-400 bg-white px-2 py-0.5 rounded-full border border-slate-100 whitespace-nowrap">
                      {new Date(act.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar Column */}
        <div className="space-y-6">
          {/* Enrich Profile Summary Widget */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                <User className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-black text-slate-900">My Profile</p>
                <p className="text-xs text-slate-600">Details & Snapshot</p>
              </div>
            </div>
            <div className="mt-4 space-y-2.5">
              <SnapshotRow
                icon={<User className="h-3.5 w-3.5 text-slate-400" />}
                label="Emp ID"
                value={profile.employee_id}
              />
              <SnapshotRow
                icon={<BriefcaseBusiness className="h-3.5 w-3.5 text-slate-400" />}
                label="Role"
                value={profile.designation || "-"}
              />
              <SnapshotRow
                icon={<User className="h-3.5 w-3.5 text-slate-400" />}
                label="Department"
                value={profile.department || "-"}
              />
              <SnapshotRow
                icon={<BriefcaseBusiness className="h-3.5 w-3.5 text-emerald-600" />}
                label="Active Projects"
                value={String(stats.activeProjects)}
              />
              <SnapshotRow
                icon={<CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
                label="Completed Projects"
                value={String(stats.completedProjects)}
              />
            </div>
            <Link
              href="/employee/profile"
              className="mt-4 flex w-full items-center justify-center gap-1 rounded-xl bg-slate-50 border border-slate-200 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-emerald-700 transition-colors"
            >
              View Full Profile{" "}
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Announcements */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="flex items-center gap-2 text-base font-bold tracking-tight text-slate-900">
                <Megaphone className="h-4.5 w-4.5 text-emerald-600" />
                Announcements
              </h2>
              <Link
                href="/employee/announcements"
                className="text-xs text-emerald-600 hover:text-emerald-700 flex items-center gap-1 font-semibold group"
              >
                All{" "}
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {publishedAnnouncements.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <span className="h-7 w-7 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 text-xs">📢</span>
                  <p className="text-xs text-slate-500 mt-1.5">No company announcements</p>
                </div>
              ) : (
                publishedAnnouncements.map((ann) => (
                  <Link
                    key={ann.id}
                    href="/employee/announcements"
                    className="group block rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 transition-all duration-200 hover:border-emerald-200 hover:bg-white hover:shadow-2xs"
                  >
                    <h3 className="text-xs font-bold text-slate-800 transition-colors group-hover:text-emerald-700 leading-snug">
                      {ann.title}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-xs text-slate-600 leading-relaxed">
                      {ann.message}
                    </p>
                    <div className="mt-2.5 flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-400">
                        {new Date(ann.created_at).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      <span className="text-xs font-bold text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        View &rarr;
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Notifications */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <div className="mb-4 flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Alerts
                </h2>
                <p className="mt-0.5 text-xs text-slate-600">
                  Personal notification alerts
                </p>
              </div>

              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[9px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100/60">
                  <Bell className="h-4 w-4" />
                </div>
              </div>
            </div>

            <NotificationList
              notifications={recentNotifications}
              theme="emerald"
              compact
              showViewAll
              viewAllHref="/employee/notifications"
              cardHref="/employee/notifications"
            />
          </div>
        </div>
      </div>
    </div>
  );
}


function TodayStatPill({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string;
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
        <p className="text-sm font-black leading-tight mt-0.5">{value}</p>
      </div>
    </div>
  );
}

//  Helper: Snapshot Row
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

// Employee Stat Card 
function EmployeeStatCard({
  label,
  value,
  href,
  icon,
  theme = "emerald",
}: {
  label: string;
  value: React.ReactNode;
  href: string;
  icon: React.ReactNode;
  theme?: "emerald" | "amber" | "blue" | "purple";
}) {
  const themeStyles = {
    emerald: {
      bg: "bg-emerald-50 text-emerald-700 ring-emerald-100/60",
      hover: "hover:border-emerald-300 hover:shadow-emerald-50/50",
    },
    amber: {
      bg: "bg-amber-50 text-amber-700 ring-amber-100/60",
      hover: "hover:border-amber-300 hover:shadow-amber-50/50",
    },
    blue: {
      bg: "bg-blue-50 text-blue-700 ring-blue-100/60",
      hover: "hover:border-blue-300 hover:shadow-blue-50/50",
    },
    purple: {
      bg: "bg-purple-50 text-purple-700 ring-purple-100/60",
      hover: "hover:border-purple-300 hover:shadow-purple-50/50",
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
        <span className="flex items-center text-xs font-bold text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity">
          View <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
        </span>
      </div>
    </Link>
  );
}


