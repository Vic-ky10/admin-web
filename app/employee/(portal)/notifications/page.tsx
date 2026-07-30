import { Bell } from "lucide-react";

import { getNotificationsAction } from "@/features/notification/notification.action";
import NotificationList from "@/features/notification/components/NotificationList";

export default async function NotificationsPage() {
  const notifications = await getNotificationsAction();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Notifications
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            View all your recent notifications.
          </p>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
          <Bell className="h-6 w-6" />
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <NotificationList
          notifications={notifications}
          variant="page"
          theme="emerald"
          emptyTitle="No notifications"
          emptyMessage="You're all caught up."
        />
      </div>
    </div>
  );
}