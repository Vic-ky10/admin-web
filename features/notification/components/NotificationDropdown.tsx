"use client";

import Link from "next/link";
import { useTransition, useState, useEffect, useRef, useCallback } from "react";
import { Bell, Check, CheckCheck } from "lucide-react";
import { toast } from "sonner";

import Button from "@/components/ui/Button";

import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
  getNotificationsAction,
} from "../notification.action";

import { Notification } from "../notification.types";

interface NotificationDropdownProps {
  notifications: Notification[];
  unreadCount: number;
  theme?: "emerald" | "blue";
  profileId?: string;
}

export default function NotificationDropdown({
  notifications,
  theme = "emerald",
}: NotificationDropdownProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [pending, startTransition] = useTransition();
  const [prevNotifications, setPrevNotifications] =
    useState<Notification[]>(notifications);
  const [localNotifications, setLocalNotifications] =
    useState<Notification[]>(notifications);

  const pendingReadIdsRef = useRef<Set<string>>(new Set());
  const pendingAllReadRef = useRef(false);

  // Sync state during render phase if prop notifications updates
  if (notifications !== prevNotifications) {
    setPrevNotifications(notifications);
    setLocalNotifications(notifications);
  }

  // Re-fetch from Server Action when the window regains focus, so the dropdown
  // stays fresh even though the layout Server Component won't re-run on router.refresh().
  const refreshFromServer = useCallback(async () => {
    const fresh = await getNotificationsAction();
    setLocalNotifications(fresh);
  }, []);

  useEffect(() => {
    window.addEventListener("focus", refreshFromServer);
    return () => window.removeEventListener("focus", refreshFromServer);
  }, [refreshFromServer]);

  useEffect(() => {
    window.addEventListener("realtime-notifications-refresh", refreshFromServer);
    return () => window.removeEventListener("realtime-notifications-refresh", refreshFromServer);
  }, [refreshFromServer]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);


  const localUnreadCount = localNotifications.filter((n) => !n.is_read).length;
  const isBlue = theme === "blue";

  const notificationPage = isBlue
    ? "/notifications"
    : "/employee/notifications";

  function markRead(id: string) {
    // Add to optimistic pending reads
    pendingReadIdsRef.current.add(id);
    setLocalNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
    );

    startTransition(async () => {
      const result = await markNotificationReadAction(id);

      // Remove from optimistic pending reads
      pendingReadIdsRef.current.delete(id);

      if (!result.success) {
        toast.error(result.error ?? "Unable to update notification.");
        // Fetch to restore actual state
        const fresh = await getNotificationsAction();
        setLocalNotifications(fresh);
        return;
      }

      toast.success("Notification updated.");
    });
  }

  function markAllRead() {

    pendingAllReadRef.current = true;
    setLocalNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));

    startTransition(async () => {
      const result = await markAllNotificationsReadAction();

      
      pendingAllReadRef.current = false;

      if (!result.success) {
        toast.error(result.error ?? "Unable to update notifications.");
        // Fetch to restore actual state
        const fresh = await getNotificationsAction();
        setLocalNotifications(fresh);
        return;
      }

      toast.success("All notifications marked as read.");
    });
  }

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={[
          "relative flex items-center justify-center rounded-full p-2 transition-colors duration-200",
          theme === "blue"
            ? "text-slate-600 hover:bg-blue-50 hover:text-blue-700 active:bg-blue-100"
            : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 active:bg-emerald-100"
        ].join(" ")}
      >
        <Bell className="h-6 w-6" />

        {localUnreadCount > 0 && (
          <span className="absolute right-0.5 top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white ring-2 ring-white">
            {localUnreadCount > 99 ? '99+' : localUnreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[370px] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Notifications
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                {localUnreadCount} unread notifications
              </p>
            </div>

            {localUnreadCount > 0 && (
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

          <div className="max-h-[400px] overflow-y-auto">
            {localNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
                <Bell className="mb-4 h-12 w-12 text-slate-300" />

                <p className="text-base font-semibold text-slate-700">
                  No notifications
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  You&apos;re all caught up.
                </p>
              </div>
            ) : (
              <div className="flex flex-col p-2 gap-1">
                {localNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={[
                      "group relative rounded-xl px-4 py-3.5 transition-all duration-200 flex items-start gap-3.5",
                      !notification.is_read 
                        ? (isBlue ? "bg-blue-50/70 hover:bg-blue-100" : "bg-emerald-50/70 hover:bg-emerald-100")
                        : "bg-transparent hover:bg-slate-100",
                    ].join(" ")}
                  >
                    {!notification.is_read && (
                      <span
                        className={[
                          "absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full",
                          isBlue ? "bg-blue-600" : "bg-emerald-600",
                        ].join(" ")}
                      />
                    )}

                    <div
                      className={[
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold shadow-sm ring-1 ring-inset",
                        !notification.is_read
                          ? (isBlue ? "bg-blue-100 text-blue-700 ring-blue-200" : "bg-emerald-100 text-emerald-700 ring-emerald-200")
                          : "bg-slate-100 text-slate-600 ring-slate-200/50",
                      ].join(" ")}
                    >
                      {notification.title.charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">
                            {notification.title}
                          </p>

                          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500 break-words">
                            {notification.message}
                          </p>

                          {/* <p className="mt-2 text-[11px] font-medium text-slate-400">
                            {new Date(notification.created_at)
                              .toISOString()
                              .replace("T", " ")
                              .slice(0, 16)}
                          </p>  */}
                        </div>

                        {!notification.is_read && (
                          <div className="shrink-0 pt-0.5">
                            <Button
                              type="button"
                              variant="secondary"
                              onClick={() => markRead(notification.id)}
                              disabled={pending}
                              className="h-7 w-7 p-0 rounded-full"
                            >
                              <Check className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        )}
                      </div>

                      {(() => {
                        let finalActionUrl = notification.action_url;
                        if (!isBlue && finalActionUrl) {
                          if (
                            finalActionUrl === "/employee/expenses" ||
                            finalActionUrl === "/(employee)/expenses" ||
                            finalActionUrl === "/(employee)/expense"
                          ) {
                            finalActionUrl = "/employee/expense-tracker";
                          } else if (finalActionUrl === "/(employee)/leave") {
                            finalActionUrl = "/employee/leave";
                          }
                        } else if (isBlue && finalActionUrl) {
                          finalActionUrl = finalActionUrl.replace("/employee", "");
                        }

                        if (!finalActionUrl) return null;

                        return (
                          <div className="mt-2">
                            <Link
                              href={finalActionUrl}
                              onClick={() => setOpen(false)}
                              className={[
                                "text-xs font-semibold inline-flex items-center gap-1 hover:underline",
                                isBlue ? "text-blue-600" : "text-emerald-600"
                              ].join(" ")}
                              prefetch={false}
                            >
                              Open <span>→</span>
                            </Link>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {localNotifications.length > 0 && (
            <div className="border-t border-slate-100 bg-slate-50 px-6 py-4 text-center">
              <Link
                href={notificationPage}
                className={[
                  "text-sm font-semibold transition",
                  isBlue
                    ? "text-blue-700 hover:text-blue-800"
                    : "text-emerald-700 hover:text-emerald-800",
                ].join(" ")}
              >
                View All Notifications →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
