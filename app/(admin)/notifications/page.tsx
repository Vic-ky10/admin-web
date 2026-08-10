import { Bell } from "lucide-react";
import { getNotificationsAction } from "@/features/notification/notification.action";
import NotificationList from "@/features/notification/components/NotificationList";
import PageHeader from "@/components/layout/PageHeader";

export const dynamic = "force-dynamic";

export default async function AdminNotificationsPage() {
  const notifications = await getNotificationsAction();

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const readCount = notifications.length - unreadCount;
  const todayCount = notifications.filter(
    (n) => new Date(n.created_at).toDateString() === new Date().toDateString()
  ).length;

  return (
    <div className="space-y-6 max-w-[1920px] mx-auto animate-fade-in">
      <PageHeader
        title="Notifications"
        description="Stay updated with all workspace updates, requests, and system alerts."
        breadcrumbs={[{ label: "Admin", href: "/dashboard" }, { label: "Notifications" }]}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Alerts</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
              <Bell className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-3 text-3xl font-black text-slate-900">{notifications.length}</p>
        </div>

        {/* Unread */}
        <div className="relative overflow-hidden rounded-2xl border border-blue-200 bg-blue-50/30 p-5 shadow-xs">
          <span className="absolute top-0 bottom-0 left-0 w-1 bg-blue-600" />
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">Unread</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100/60 text-blue-700">
              <Bell className="h-4 w-4 animate-pulse" />
            </span>
          </div>
          <p className="mt-3 text-3xl font-black text-blue-700">{unreadCount}</p>
        </div>

        {/* Read */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Read</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
              <Bell className="h-4 w-4 opacity-50" />
            </span>
          </div>
          <p className="mt-3 text-3xl font-black text-slate-900">{readCount}</p>
        </div>

        {/* Today */}
        <div className="relative overflow-hidden rounded-2xl border border-amber-200 bg-amber-50/30 p-5 shadow-xs">
          <span className="absolute top-0 bottom-0 left-0 w-1 bg-amber-500" />
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Today</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100/60 text-amber-700">
              <Bell className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-3 text-3xl font-black text-amber-700">{todayCount}</p>
        </div>
      </div>

      {/* Notification List Container */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs">
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

