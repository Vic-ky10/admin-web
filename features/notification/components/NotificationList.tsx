"use client";

import Link from "next/link";
import {
  Bell,
  Calendar,
  CreditCard,
  Briefcase,
  Award,
  CheckSquare,
  FileText,
  UserCheck,
} from "lucide-react";

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

function getNotificationStyles(notification: Notification, isBlue: boolean) {
  const type = (notification.notification_type || "").toLowerCase();
  const title = (notification.title || "").toLowerCase();
  const msg = (notification.message || "").toLowerCase();

  let Icon = Bell;
  let iconBg = isBlue ? "bg-blue-50/80 text-blue-600 ring-blue-100/50" : "bg-emerald-50/80 text-emerald-600 ring-emerald-100/50";

  if (type.includes("leave") || title.includes("leave") || msg.includes("leave")) {
    Icon = Calendar;
    iconBg = "bg-rose-50/80 text-rose-600 ring-rose-100/50";
  } else if (
    type.includes("expense") ||
    title.includes("expense") ||
    msg.includes("expense") ||
    type.includes("purchase") ||
    title.includes("purchase")
  ) {
    Icon = CreditCard;
    iconBg = "bg-amber-50/80 text-amber-600 ring-amber-100/50";
  } else if (type.includes("project") || title.includes("project")) {
    Icon = Briefcase;
    iconBg = "bg-indigo-50/80 text-indigo-600 ring-indigo-100/50";
  } else if (
    type.includes("incentive") ||
    title.includes("incentive") ||
    type.includes("sale") ||
    title.includes("sale")
  ) {
    Icon = Award;
    iconBg = "bg-purple-50/80 text-purple-600 ring-purple-100/50";
  } else if (type.includes("attendance") || title.includes("attendance")) {
    Icon = UserCheck;
    iconBg = "bg-teal-50/80 text-teal-600 ring-teal-100/50";
  } else if (type.includes("task") || title.includes("task")) {
    Icon = CheckSquare;
    iconBg = "bg-sky-50/80 text-sky-600 ring-sky-100/50";
  } else if (type.includes("announcement") || title.includes("announcement")) {
    Icon = FileText;
    iconBg = "bg-emerald-50/80 text-emerald-600 ring-emerald-100/50";
  }

  return { Icon, iconBg };
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
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 py-12 px-4 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-slate-400 ring-4 ring-slate-100/50">
            <Bell className="h-6 w-6 text-slate-400" />
          </div>

          <p className="mt-4 font-semibold text-slate-700">{emptyTitle}</p>

          <p className="mt-1 text-xs md:text-sm text-slate-400 max-w-xs">{emptyMessage}</p>
        </div>
      ) : (
        <>
          {variant === "compact" ? (
          <div className="space-y-4">
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
            <div className="flex flex-col gap-3 sm:gap-4 py-4 md:py-6">
              {notifications.map((notification) => {
                let baseActionUrl = notification.action_url;
                if (!isBlue && baseActionUrl) {
                  if (
                    baseActionUrl === "/employee/expenses" ||
                    baseActionUrl === "/(employee)/expenses" ||
                    baseActionUrl === "/(employee)/expense"
                  ) {
                    baseActionUrl = "/employee/expense-tracker";
                  } else if (baseActionUrl === "/(employee)/leave") {
                    baseActionUrl = "/employee/leave";
                  }
                }
                const actionUrl =
                  isBlue
                    ? baseActionUrl?.replace("/employee", "")
                    : baseActionUrl;
                const { Icon, iconBg } = getNotificationStyles(notification, isBlue);

                return (
                  <div
                    key={notification.id}
                    className={[
                      "group relative overflow-hidden rounded-2xl border px-5 py-4.5 md:px-6 md:py-5 transition-all duration-300 hover:shadow-sm flex items-start gap-4",
                      !notification.is_read
                        ? theme === "blue"
                          ? "border-blue-100 bg-blue-50/40 hover:bg-blue-50/60"
                          : "border-emerald-100 bg-emerald-50/40 hover:bg-emerald-50/60"
                        : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50",
                    ].join(" ")}
                  >
                    {/* Left border indicator for unread states */}
                    {!notification.is_read && (
                      <span
                        className={[
                          "absolute top-0 bottom-0 left-0 w-1",
                          theme === "blue" ? "bg-blue-600" : "bg-emerald-600",
                        ].join(" ")}
                      />
                    )}

                    {/* Icon Badge */}
                    <div
                      className={[
                        "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 shadow-sm",
                        iconBg,
                      ].join(" ")}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-sm font-semibold text-slate-900 leading-snug group-hover:text-slate-950 transition-colors">
                          {notification.title}
                        </h3>

                        {!notification.is_read && (
                          <span
                            className={[
                              "shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase",
                              theme === "blue"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-emerald-100 text-emerald-800",
                            ].join(" ")}
                          >
                            New
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-slate-500 leading-relaxed break-words">
                        {notification.message}
                      </p>

                      <div className="pt-2 flex items-center justify-between">
                        <span className="text-[11px] font-medium text-slate-400">
                          {new Date(notification.created_at).toLocaleString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>

                        {actionUrl && (
                          <Link
                            href={actionUrl}
                            className={[
                              "text-xs font-semibold flex items-center gap-1 opacity-0 translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 hover:underline",
                              theme === "blue" ? "text-blue-600" : "text-emerald-600",
                            ].join(" ")}
                            prefetch={false}
                          >
                            View Details <span>→</span>
                          </Link>
                        )}
                      </div>
                    </div>
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
                  "text-xs md:text-sm font-semibold transition hover:underline",
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