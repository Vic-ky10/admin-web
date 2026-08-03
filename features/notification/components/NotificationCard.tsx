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

import { Notification } from "../notification.types";

interface NotificationCardProps {
  notification: Notification;
  theme?: "emerald" | "blue";
  compact?: boolean;
  href?: string;
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

export default function NotificationCard({
  notification,
  theme = "emerald",
  compact = false,
  href,
}: NotificationCardProps) {
  const isBlue = theme === "blue";
  const { Icon, iconBg } = getNotificationStyles(notification, isBlue);

  const cardContent = (
    <div
      className={[
        "group relative overflow-hidden rounded-2xl border transition-all duration-300 hover:shadow-md",
        compact ? "p-4" : "p-5",
        !notification.is_read
          ? isBlue
            ? "border-blue-100 bg-blue-50/30 hover:bg-blue-50/50"
            : "border-emerald-100 bg-emerald-50/30 hover:bg-emerald-50/50"
          : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50/50",
      ].join(" ")}
    >
      {/* Accent left border for unread notifications */}
      {!notification.is_read && (
        <span
          className={[
            "absolute top-0 bottom-0 left-0 w-1",
            isBlue ? "bg-blue-600" : "bg-emerald-600",
          ].join(" ")}
        />
      )}

      <div className="flex gap-4">
        {/* Category Icon Badge */}
        <div
          className={[
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1",
            iconBg,
          ].join(" ")}
        >
          <Icon className="h-5 w-5 animate-pulse-slow" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-sm font-semibold text-slate-800 leading-snug group-hover:text-slate-950 transition-colors">
              {notification.title}
            </h3>

            {!notification.is_read && (
              <span
                className={[
                  "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase",
                  isBlue
                    ? "bg-blue-100 text-blue-800"
                    : "bg-emerald-100 text-emerald-800",
                ].join(" ")}
              >
                New
              </span>
            )}
          </div>

          <p className="mt-1.5 text-xs md:text-sm text-slate-500 leading-relaxed break-words">
            {notification.message}
          </p>

          <div className="mt-3.5 flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-400">
              {new Date(notification.created_at).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>

            <span
              className={[
                "text-xs font-semibold flex items-center gap-1 opacity-0 translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0",
                isBlue ? "text-blue-600" : "text-emerald-600",
              ].join(" ")}
            >
              View <span className="text-[10px]">→</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block transition-transform duration-300 active:scale-[0.99]">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}