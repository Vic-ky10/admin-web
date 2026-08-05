"use client";

import Link from "next/link";
import { useTransition, useState, useEffect, useRef } from "react";
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
  const isFetchingRef = useRef(false);
  const pendingReadIdsRef = useRef<Set<string>>(new Set());
  const pendingAllReadRef = useRef(false);

  // Sync state during render phase if prop notifications updates
  if (notifications !== prevNotifications) {
    setPrevNotifications(notifications);
    setLocalNotifications(notifications);
  }

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

  // Dynamic unread count based on current local/optimistic state
  const localUnreadCount = localNotifications.filter((n) => !n.is_read).length;
  const isBlue = theme === "blue";

  const notificationPage = isBlue
    ? "/notifications"
    : "/employee/notifications";

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    const poll = async () => {
      if (document.hidden || isFetchingRef.current) return;
      isFetchingRef.current = true;
      try {
        const fresh = await getNotificationsAction();
        // Merge fetched notifications with optimistic local updates
        const merged = fresh.map((n) => {
          if (
            pendingAllReadRef.current ||
            pendingReadIdsRef.current.has(n.id)
          ) {
            return { ...n, is_read: true };
          }
          return n;
        });
        setLocalNotifications(merged);
      } catch (error) {
        console.error("Failed to poll notifications in background:", error);
      } finally {
        isFetchingRef.current = false;
      }
    };

    const startPolling = () => {
      if (!intervalId) {
        intervalId = setInterval(poll, 5000);
      }
    };

    const stopPolling = () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopPolling();
      } else {
        poll(); // Fetch immediately when tab becomes visible
        startPolling();
      }
    };

    if (!document.hidden) {
      startPolling();
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      stopPolling();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

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
    // Add to optimistic pending all read
    pendingAllReadRef.current = true;
    setLocalNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));

    startTransition(async () => {
      const result = await markAllNotificationsReadAction();

      // Reset optimistic pending all read
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
      <button type="button" onClick={() => setOpen(!open)} className="...">
        <Bell className="h-7 w-7" />

        {localUnreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white ring-2 ring-white">
            {localUnreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-3 w-[370px] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-150">
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
              localNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={[
                    "border-b border-slate-100 px-6 py-5 transition-all duration-200 hover:bg-slate-50",
                    !notification.is_read ? "bg-emerald-50/40" : "bg-white",
                  ].join(" ")}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-700">
                      {notification.title.charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {notification.title}
                          </p>

                          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                            {notification.message}
                          </p>

                          <p className="mt-3 text-xs text-slate-400">
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
                          onClick={() => setOpen(false)}
                        >
                          Open →
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))
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
