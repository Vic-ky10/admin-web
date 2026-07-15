"use client";

import Link from "next/link";
import { useTransition } from "react";
import { Bell, Check, CheckCheck } from "lucide-react";
import { toast } from "sonner";

import Button from "@/components/ui/Button";

import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "../notification.action";

import { Notification } from "../notification.types";

interface NotificationDropdownProps {
  notifications: Notification[];
  unreadCount: number;
}

export default function NotificationDropdown({
  notifications,
  unreadCount,
}: NotificationDropdownProps) {
  const [pending, startTransition] = useTransition();

  function markRead(id: string) {
    startTransition(async () => {
      const result = await markNotificationReadAction(id);

      if (!result.success) {
        toast.error(result.error ?? "Unable to update notification.");
        return;
      }

      toast.success("Notification updated.");
    });
  }

  function markAllRead() {
    startTransition(async () => {
      const result = await markAllNotificationsReadAction();

      if (!result.success) {
        toast.error(result.error ?? "Unable to update notifications.");
        return;
      }

      toast.success("All notifications marked as read.");
    });
  }

  return (
    <details className="relative">
      <summary className="relative inline-flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-blue-300 hover:text-blue-700">
        <Bell className="h-5 w-5" />

        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-bold text-white">
            {unreadCount}
          </span>
        )}
      </summary>

      <div className="absolute right-0 mt-2 w-96 rounded-lg border border-slate-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 p-4">
          <div>
            <h3 className="font-semibold text-slate-900">Notifications</h3>

            <p className="text-xs text-slate-500">{unreadCount} unread</p>
          </div>

          {unreadCount > 0 && (
            <Button
              type="button"
              variant="secondary"
              onClick={markAllRead}
              disabled={pending}
            >
              <CheckCheck className="mr-2 h-4 w-4" />
              Read All
            </Button>
          )}
        </div>

        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-6 text-center">
              <Bell className="mx-auto h-10 w-10 text-slate-300" />

              <p className="mt-3 font-medium text-slate-700">
                No notifications
              </p>

              <p className="text-sm text-slate-500">You&apos;re all caught up..</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={[
                  "border-b border-slate-100 p-4 transition",
                  !notification.is_read ? "bg-blue-50" : "bg-white",
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">
                      {notification.title}
                    </p>

                    <p className="mt-1 text-sm text-slate-600">
                      {notification.message}
                    </p>

                    <p className="mt-2 text-xs text-slate-400">
                      {new Date(notification.created_at)
                        .toISOString()
                        .replace("T", " ")
                        .slice(0, 16)}
                    </p>
                  </div>

                  {!notification.is_read && (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => markRead(notification.id)}
                      disabled={pending}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {notification.action_url && (
                  <Link
                    href={notification.action_url}
                    className="mt-3 inline-block text-sm font-medium text-blue-600 hover:underline"
                  >
                    Open →
                  </Link>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </details>
  );
}
