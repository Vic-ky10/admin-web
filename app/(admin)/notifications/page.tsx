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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Notifications</h1>

          <p className="mt-1 text-sm text-slate-500">
            Stay updated with all system activities and alerts.
          </p>
        </div>

        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <Bell className="h-7 w-7" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Total
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {notifications.length}
          </p>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-blue-600">
            Unread
          </p>
          <p className="mt-2 text-3xl font-bold text-blue-700">{unreadCount}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Read
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{readCount}</p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-amber-600">
            Today
          </p>
          <p className="mt-2 text-3xl font-bold text-amber-700">{todayCount}</p>
        </div>
      </div>

      {/* Notification List */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
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
