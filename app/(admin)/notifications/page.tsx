import { Bell } from "lucide-react";
import { getNotificationsAction } from "@/features/notification/notification.action";
import NotificationList from "@/features/notification/components/NotificationList";

export default async function AdminNotificationsPage() {
  const notifications = await getNotificationsAction();

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const readCount = notifications.length - unreadCount;
  const todayCount = notifications.filter(
    (n) => new Date(n.created_at).toDateString() === new Date().toDateString(),
  ).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-100">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">Alert Center</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Notifications</h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Stay updated with all system activities and administrative alerts.
          </p>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100/50">
          <Bell className="h-6 w-6" />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Alerts</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-400">
              <Bell className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-4 text-3xl font-bold text-slate-900">{notifications.length}</p>
        </div>

        {/* Unread */}
        <div className="relative overflow-hidden rounded-2xl border border-blue-100 bg-blue-50/20 p-5 hover:shadow-md transition-all duration-300">
          <span className="absolute top-0 bottom-0 left-0 w-1 bg-blue-600" />
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">Unread</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100/50 text-blue-600">
              <Bell className="h-4 w-4 animate-pulse" />
            </span>
          </div>
          <p className="mt-4 text-3xl font-bold text-blue-700">{unreadCount}</p>
        </div>

        {/* Read */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Read</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-400">
              <Bell className="h-4 w-4 opacity-50" />
            </span>
          </div>
          <p className="mt-4 text-3xl font-bold text-slate-900">{readCount}</p>
        </div>

        {/* Today */}
        <div className="relative overflow-hidden rounded-2xl border border-amber-100 bg-amber-50/20 p-5 hover:shadow-md transition-all duration-300">
          <span className="absolute top-0 bottom-0 left-0 w-1 bg-amber-500" />
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600">Today</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100/50 text-amber-600">
              <Bell className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-4 text-3xl font-bold text-amber-700">{todayCount}</p>
        </div>
      </div>

      {/* Notification List Container */}
      <div className="shadow-sm">
        <NotificationList
          notifications={notifications}
          theme="blue"
          variant="page"
          emptyTitle="No notifications"
          emptyMessage="You're all caught up."
        />
      </div>
    </div>
  );
}
