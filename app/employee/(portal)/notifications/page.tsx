import { getNotificationsAction } from "@/features/notification/notification.action";
import NotificationList from "@/features/notification/components/NotificationList";
import PageHeader from "@/components/layout/PageHeader";

export default async function NotificationsPage() {
  const notifications = await getNotificationsAction();

  return (
    <div className="space-y-6 max-w-[1920px] mx-auto animate-fade-in">
      <PageHeader
        title="Alerts & Notifications"
        description="Stay updated with personal system alerts, approvals, and company updates."
        breadcrumbs={[{ label: "Portal", href: "/employee/dashboard" }, { label: "Notifications" }]}
      />

      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs">
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