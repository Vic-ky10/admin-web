"use client";

import Link from "next/link";
import { Bell } from "lucide-react";

import NotificationCard from "./NotificationCard";
import { Notification } from "../notification.types";

interface NotificationListProps {
  notifications: Notification[];
  theme?: "emerald" | "blue";
  variant?: "compact" | "page";
  compact?: boolean;
  showViewAll?: boolean;
  viewAllHref?: string;
  cardHref?: string;
  emptyTitle?: string;
  emptyMessage?: string;
}

export default function NotificationList({
  notifications,
  theme = "emerald",
  variant = "compact",
  compact = false,
  showViewAll = false,
  viewAllHref = "#",
  cardHref,
  emptyTitle = "No notifications",
  emptyMessage = "You're all caught up.",
}: NotificationListProps) {
  const isBlue = theme === "blue";

  return (
    <>
      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 py-10">
          <Bell className="mb-3 h-10 w-10 text-slate-300" />

          <p className="font-medium text-slate-500">{emptyTitle}</p>

          <p className="mt-1 text-sm text-slate-400">{emptyMessage}</p>
        </div>
      ) : (
        <>
          {variant === "compact" ? (
            <div className={compact ? "space-y-4" : "space-y-5"}>
              {notifications.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  theme={theme}
                  compact={compact}
                  href={cardHref}
                />
              ))}
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {notifications.map((notification) => {
                const actionUrl =
                  theme === "blue"
                    ? notification.action_url?.replace("/employee", "")
                    : notification.action_url;

                return (
                  <div
                    key={notification.id}
                    className={[
                      "px-8 py-6 transition hover:bg-slate-50",
                      !notification.is_read
                        ? theme === "blue"
                          ? "bg-blue-50/40"
                          : "bg-emerald-50/40"
                        : "",
                    ].join(" ")}
                  >
                    <div className="flex items-start justify-between gap-6">
                      <div className="flex-1 space-y-3">
                        <h3 className="text-base font-semibold text-slate-900">
                          {notification.title}
                        </h3>

                        <p className="text-sm leading-7 text-slate-600">
                          {notification.message}
                        </p>

                        <p className="pt-1 text-xs text-slate-400">
                          {new Date(notification.created_at).toLocaleString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </p>
                      </div>

                      {!notification.is_read && (
                        <span
                          className={[
                            "rounded-full border px-3 py-1 text-xs font-medium",
                            theme === "blue"
                              ? "border-blue-200 bg-blue-50 text-blue-700"
                              : "border-emerald-200 bg-emerald-50 text-emerald-700",
                          ].join(" ")}
                        >
                          New
                        </span>
                      )}
                    </div>

                    {actionUrl && (
                      <Link
                        href={actionUrl}
                        className={[
                          "mt-4 inline-block text-sm font-medium hover:underline",
                          theme === "blue"
                            ? "text-blue-600"
                            : "text-emerald-600",
                        ].join(" ")}
                      >
                        Open →
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {showViewAll && (
            <div className="mt-5 border-t border-slate-100 pt-4 text-center">
              <Link
                href={viewAllHref}
                className={[
                  "text-sm font-semibold transition hover:underline",
                  isBlue
                    ? "text-blue-700 hover:text-blue-800"
                    : "text-emerald-700 hover:text-emerald-800",
                ].join(" ")}
              >
                View All Notifications →
              </Link>
            </div>
          )}
        </>
      )}
    </>
  );
}