import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Bell,
  Calendar,
  CalendarCheck,
  Clock,
  CreditCard,
  Megaphone,
  Plus,
} from "lucide-react";
import {
  getCurrentEmployeeProfile,
  getEmployeeDashboardStats,
  getEmployeeRecentActivity,
} from "@/features/employee-portal/employee-portal.service";
import { getAnnouncements } from "@/features/announcement/announcement.service";
import { getNotifications } from "@/features/notification/notification.service";
import { ANNOUNCEMENT_STATUS } from "@/features/announcement/announcement.types";

export const dynamic = "force-dynamic";

export default async function EmployeeDashboardPage() {
  const profile = await getCurrentEmployeeProfile();

  if (!profile) {
    redirect("/employee/login");
  }

  const [stats, activities, announcements, notifications] = await Promise.all([
    getEmployeeDashboardStats(profile.id),
    getEmployeeRecentActivity(profile.id),
    getAnnouncements(),
    getNotifications(profile.id),
  ]);

  const publishedAnnouncements = announcements
    .filter((ann) => ann.status === ANNOUNCEMENT_STATUS.PUBLISHED)
    .slice(0, 3);

  const recentNotifications = notifications.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
            Overview
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">
            Employee Dashboard
          </h1>
          <p className="mt-2 text-slate-500">
            Welcome back, {profile.full_name} ({profile.designation} &bull;{" "}
            {profile.department})
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardCard
          label="Leave Balance"
          value={`${stats.leaveBalance} Days`}
          href="/employee/leave"
          icon={<Calendar className="h-5 w-5" />}
        />
        <DashboardCard
          label="Pending Leave Requests"
          value={stats.pendingLeaveRequests}
          href="/employee/leave?status=Pending"
          icon={<CalendarCheck className="h-5 w-5" />}
        />
        <DashboardCard
          label="Pending Expenses"
          value={stats.pendingExpenses}
          href="/employee/expenses"
          icon={<CreditCard className="h-5 w-5" />}
        />
        <DashboardCard
          label="Unread Notifications"
          value={stats.unreadNotifications}
          href="/employee/dashboard"
          icon={<Bell className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Quick Actions & Recent Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-950">Quick Actions</h2>
            <div className="mt-4 grid gap-4 grid-cols-2 sm:grid-cols-4">
              <Link
                href="/employee/leave"
                className="flex flex-col items-center justify-center p-4 border border-slate-200 rounded-lg hover:border-emerald-300 hover:bg-emerald-50/10 transition text-center"
              >
                <Calendar className="h-6 w-6 text-emerald-600" />
                <span className="mt-2 text-xs font-semibold text-slate-700">
                  Apply Leave
                </span>
              </Link>
              <Link
                href="/employee/expenses"
                className="flex flex-col items-center justify-center p-4 border border-slate-200 rounded-lg hover:border-emerald-300 hover:bg-emerald-50/10 transition text-center"
              >
                <CreditCard className="h-6 w-6 text-emerald-600" />
                <span className="mt-2 text-xs font-semibold text-slate-700">
                  Add Expense
                </span>
              </Link>
              <Link
                href="/employee/tasks"
                className="flex flex-col items-center justify-center p-4 border border-slate-200 rounded-lg hover:border-emerald-300 hover:bg-emerald-50/10 transition text-center"
              >
                <Clock className="h-6 w-6 text-emerald-600" />
                <span className="mt-2 text-xs font-semibold text-slate-700">
                  My Tasks
                </span>
              </Link>
              <Link
                href="/employee/incentives"
                className="flex flex-col items-center justify-center p-4 border border-slate-200 rounded-lg hover:border-emerald-300 hover:bg-emerald-50/10 transition text-center"
              >
                <Plus className="h-6 w-6 text-emerald-600" />
                <span className="mt-2 text-xs font-semibold text-slate-700">
                  Incentives
                </span>
              </Link>
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
              <Megaphone className="h-5 w-5 text-emerald-600" />
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
                      href="/employee/announcements"
                      className="font-semibold text-slate-950 hover:text-emerald-700 hover:underline block text-sm"
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
              <Bell className="h-5 w-5 text-emerald-600" />
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
                      <span className="h-2 w-2 rounded-full bg-emerald-600 mt-1 shrink-0" />
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
      className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-100/70"
    >
      <div className="flex items-center justify-between">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
          {icon}
        </span>
      </div>
      <p className="mt-5 text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-slate-950">{value}</p>
    </Link>
  );
}
