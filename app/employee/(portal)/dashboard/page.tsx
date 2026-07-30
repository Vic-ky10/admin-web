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
  User,
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
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                  Welcome back, {profile.full_name.split(" ")[0]}
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  {profile.designation} • {profile.department}
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
                Employee ID : {profile.employee_id}
              </span>

              <span className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
                Active Employee
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <Link
              href="/employee/profile"
              className="group flex min-w-[180px] items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 transition group-hover:scale-110">
                <User className="h-6 w-6" />
              </div>

              <div>
                <p className="font-semibold text-slate-900">My Profile</p>
                <p className="text-xs text-slate-500">View & update profile</p>
              </div>
            </Link>

            <Link
              href="/employee/announcements"
              className="group flex min-w-[180px] items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-amber-300 hover:shadow-lg"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-700 transition group-hover:scale-110">
                <Megaphone className="h-6 w-6" />
              </div>

              <div>
                <p className="font-semibold text-slate-900">Announcements</p>
                <p className="text-xs text-slate-500">Company updates</p>
              </div>
            </Link>

            <Link
              href="/employee/tasks"
              className="group flex min-w-[180px] items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-violet-300 hover:shadow-lg"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-700 transition group-hover:scale-110">
                <Clock className="h-6 w-6" />
              </div>

              <div>
                <p className="font-semibold text-slate-900">My Tasks</p>
                <p className="text-xs text-slate-500">View assigned work</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

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
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Recent Activity
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Your latest updates and actions.
                </p>
              </div>

              <Clock className="h-6 w-6 text-slate-400" />
            </div>

            <div className="space-y-4">
              {activities.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 py-10">
                  <Clock className="mb-3 h-10 w-10 text-slate-300" />
                  <p className="font-medium text-slate-500">
                    No recent activity
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    Your recent actions will appear here.
                  </p>
                </div>
              ) : (
                activities.map((act) => (
                  <div
                    key={act.id}
                    className="group flex items-start justify-between rounded-2xl border border-slate-200 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300 hover:bg-emerald-50/30 hover:shadow-md"
                  >
                    <div className="flex gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-white text-lg font-bold text-slate-700 shadow-sm transition-all duration-300 group-hover:shadow-md">
                        {act.title.charAt(0).toUpperCase()}
                      </div>

                      <div>
                        <h3 className="font-semibold text-slate-900">
                          {act.title}
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          {act.description}
                        </p>
                      </div>
                    </div>

                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
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
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Announcements
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Latest company updates and news.
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <Megaphone className="h-5 w-5" />
              </div>
            </div>

            <div className="space-y-4">
              {publishedAnnouncements.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 py-10">
                  <Megaphone className="mb-3 h-10 w-10 text-slate-300" />
                  <p className="font-medium text-slate-500">No announcements</p>
                  <p className="mt-1 text-sm text-slate-400">
                    Company announcements will appear here.
                  </p>
                </div>
              ) : (
                publishedAnnouncements.map((ann) => (
                  <Link
                    key={ann.id}
                    href="/employee/announcements"
                    className="group block rounded-2xl border border-slate-200 bg-slate-50/60 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:bg-white hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="mb-3 flex items-center gap-2">
                          <span className="rounded-fullbg-emerald-100 text-emerald-700 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-blue-700">
                            Announcement
                          </span>
                        </div>

                        <h3 className="text-sm font-semibold text-slate-900 transition group-hover:text-emerald-700">
                          {ann.title}
                        </h3>

                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                          {ann.message}
                        </p>

                        <div className="mt-4 flex items-center justify-between">
                          <span className="text-xs text-slate-400">
                            {new Date(ann.created_at).toLocaleDateString(
                              "en-IN",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </span>

                          <span className="text-xs font-medium text-emerald-600 opacity-0 transition-opacity group-hover:opacity-100">
                            View →
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Notifications */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Notifications
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Stay updated with your latest alerts.
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <Bell className="h-5 w-5" />
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
