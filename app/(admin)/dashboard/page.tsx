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
} from "lucide-react";

import { getProjectDashboardStats } from "@/features/project/project.service";
import { adminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getAnnouncements } from "@/features/announcement/announcement.service";
import { getNotifications } from "@/features/notification/notification.service";
import { ANNOUNCEMENT_STATUS } from "@/features/announcement/announcement.types";

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

  const leavesData = (leavesRes.data ?? []) as unknown as SupabaseLeaveActivityRecord[];
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

  const expensesData = (expensesRes.data ?? []) as unknown as SupabaseExpenseActivityRecord[];
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

  const incentivesData = (incentivesRes.data ?? []) as unknown as SupabaseIncentiveActivityRecord[];
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

  const attendanceData = (attendanceRes.data ?? []) as unknown as SupabaseAttendanceActivityRecord[];
  attendanceData.forEach((item) => {
    const emp = Array.isArray(item.employee) ? item.employee[0] : item.employee;
    const name = emp?.full_name ?? "Employee";
    activities.push({
      id: item.id,
      title: `${name} clocked status`,
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
  ]);

  for (const response of [
    employeeCount,
    pendingLeaveCount,
    pendingExpenseCount,
    adminProfile,
    pendingLeavesReview,
    pendingExpensesReview,
  ]) {
    if (response && "error" in response && response.error) {
      console.error(response.error);
    }
  }

  const publishedAnnouncements = announcements
    .filter((ann) => ann.status === ANNOUNCEMENT_STATUS.PUBLISHED)
    .slice(0, 3);

  const recentNotifications = notifications.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
            Overview
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">
            Admin Dashboard
          </h1>
          <p className="mt-2 text-slate-500">
            Welcome back, {adminProfile?.data?.full_name || user.email} (
            {adminProfile?.data?.designation || "Administrator"} &bull;{" "}
            {adminProfile?.data?.department || "Admin"})
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardCard
          label="Total Employees"
          value={employeeCount.count ?? 0}
          href="/employees"
          icon={<UsersRound className="h-5 w-5" />}
        />
        <DashboardCard
          label="Active Projects"
          value={projectStats.activeProjects}
          href="/projects"
          icon={<BriefcaseBusiness className="h-5 w-5" />}
        />
        <DashboardCard
          label="Pending Leave Requests"
          value={pendingLeaveCount.count ?? 0}
          href="/leave?status=Pending"
          icon={<CalendarCheck className="h-5 w-5" />}
        />
        <DashboardCard
          label="Pending Expense Requests"
          value={pendingExpenseCount.count ?? 0}
          href="/expenses?status=Pending"
          icon={<CreditCard className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">

        <div className="lg:col-span-2 space-y-6">
          {/* quick Actions */}
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-950">Quick Actions</h2>
            <div className="mt-4 grid gap-4 grid-cols-2 sm:grid-cols-4">
              <Link
                href="/projects"
                className="flex flex-col items-center justify-center p-4 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/10 transition text-center"
              >
                <BriefcaseBusiness className="h-6 w-6 text-blue-600" />
                <span className="mt-2 text-xs font-semibold text-slate-700">
                  Manage Projects
                </span>
              </Link>
              <Link
                href="/employees"
                className="flex flex-col items-center justify-center p-4 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/10 transition text-center"
              >
                <UsersRound className="h-6 w-6 text-blue-600" />
                <span className="mt-2 text-xs font-semibold text-slate-700">
                  Manage Staff
                </span>
              </Link>
              <Link
                href="/leave?status=Pending"
                className="flex flex-col items-center justify-center p-4 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/10 transition text-center"
              >
                <CalendarCheck className="h-6 w-6 text-blue-600" />
                <span className="mt-2 text-xs font-semibold text-slate-700">
                  Review Leaves
                </span>
              </Link>
              <Link
                href="/expenses?status=Pending"
                className="flex flex-col items-center justify-center p-4 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/10 transition text-center"
              >
                <CreditCard className="h-6 w-6 text-blue-600" />
                <span className="mt-2 text-xs font-semibold text-slate-700">
                  Review Expenses
                </span>
              </Link>
            </div>
          </div>

          
          <div className="grid gap-6 sm:grid-cols-2">
            
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <h3 className="font-bold text-slate-950 text-sm">
                  Pending Leaves
                </h3>
                <Link
                  href="/leave?status=Pending"
                  className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                >
                  View All <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="mt-3 divide-y divide-slate-100">
                {(pendingLeavesReview.data ?? []).length === 0 ? (
                  <p className="text-xs text-slate-500 py-4 text-center">
                    No pending leave requests.
                  </p>
                ) : (
                  ((pendingLeavesReview.data ?? []) as unknown as SupabaseLeaveActivityRecord[]).map((l) => {
                    const emp = Array.isArray(l.employee)
                      ? l.employee[0]
                      : l.employee;
                    return (
                      <div key={l.id} className="py-2.5 text-xs">
                        <p className="font-semibold text-slate-900">
                          {emp?.full_name || "Employee"}
                        </p>
                        <p className="text-slate-500 mt-0.5">
                          {l.leave_type} ({l.total_days} days)
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

             {/* Expense Approvals */}
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <h3 className="font-bold text-slate-950 text-sm">
                  Pending Expenses
                </h3>
                <Link
                  href="/expenses?status=Pending"
                  className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                >
                  View All <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="mt-3 divide-y divide-slate-100">
                {(pendingExpensesReview.data ?? []).length === 0 ? (
                  <p className="text-xs text-slate-500 py-4 text-center">
                    No pending expense claims.
                  </p>
                ) : (
                  ((pendingExpensesReview.data ?? []) as unknown as SupabaseExpenseActivityRecord[]).map((e) => {
                    const emp = Array.isArray(e.employee)
                      ? e.employee[0]
                      : e.employee;
                    return (
                      <div key={e.id} className="py-2.5 text-xs">
                        <p className="font-semibold text-slate-900">
                          {emp?.full_name || "Employee"}
                        </p>
                        <p className="text-slate-500 mt-0.5">
                          {e.description} &bull; ₹{e.amount}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-950">Recent Activity</h2>
            <div className="mt-4 divide-y divide-slate-100">
              {activities.length === 0 ? (
                <p className="py-6 text-sm text-slate-500 text-center">
                  No recent activity.
                </p>
              ) : (
                activities.map((act) => (
                  <div
                    key={act.id}
                    className="py-3.5 flex items-start justify-between gap-3 text-sm"
                  >
                    <div>
                      <p className="font-semibold text-slate-950">{act.title}</p>
                      <p className="text-slate-500 text-xs mt-0.5">
                        {act.description}
                      </p>
                    </div>
                    <span className="text-xs text-slate-400 whitespace-nowrap">
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

        {/* Right Column: Announcements & Notifications */}
        <div className="space-y-6">
          {/* Announcements */}
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-950 flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-blue-600" />
              Announcements
            </h2>
            <div className="mt-4 space-y-4">
              {publishedAnnouncements.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">
                  No announcements.
                </p>
              ) : (
                publishedAnnouncements.map((ann) => (
                  <div
                    key={ann.id}
                    className="border-b border-slate-100 pb-3 last:border-0 last:pb-0"
                  >
                    <Link
                      href="/announcements"
                      className="font-semibold text-slate-950 hover:text-blue-700 hover:underline block text-sm"
                    >
                      {ann.title}
                    </Link>
                    <p className="text-slate-600 text-xs mt-1 line-clamp-2">
                      {ann.message}
                    </p>
                    <span className="text-[10px] text-slate-400 mt-1.5 block">
                      {new Date(ann.created_at).toLocaleDateString("en-IN")}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Notifications */}
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-950 flex items-center gap-2">
              <Bell className="h-5 w-5 text-blue-600" />
              Notifications
            </h2>
            <div className="mt-4 space-y-4">
              {recentNotifications.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">
                  No notifications.
                </p>
              ) : (
                recentNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    className="flex gap-2.5 items-start text-xs border-b border-slate-100 pb-3 last:border-0 last:pb-0"
                  >
                    {!notif.is_read && (
                      <span className="h-2 w-2 rounded-full bg-blue-650 mt-1 shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="font-semibold text-slate-950">
                        {notif.title}
                      </p>
                      <p className="text-slate-500 mt-0.5">{notif.message}</p>
                      <span className="text-[10px] text-slate-400 block mt-1.5">
                        {new Date(notif.created_at).toLocaleDateString("en-IN")}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
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
}: {
  label: string;
  value: React.ReactNode;
  href: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-100/70"
    >
      <div className="flex items-center justify-between">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700 ring-1 ring-blue-100">
          {icon}
        </span>
      </div>
      <p className="mt-5 text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-slate-950">{value}</p>
    </Link>
  );
}
