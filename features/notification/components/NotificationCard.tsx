"use client";

import Link from "next/link";

import { Notification } from "../notification.types";

interface NotificationCardProps {
  notification: Notification;
  theme?: "emerald" | "blue";
  compact?: boolean;
  href?: string;
}

export default function NotificationCard({
  notification,
  theme = "emerald",
  compact = false,
  href,
}: NotificationCardProps) {
  const isBlue = theme === "blue";

  const cardContent = (
    <div
      className={[
        "group rounded-2xl border border-slate-200 transition-all duration-200 hover:border-slate-300 hover:bg-slate-50",
        compact ? "p-4" : "p-6",
        !notification.is_read
          ? isBlue
            ? "bg-blue-50/40"
            : "bg-emerald-50/40"
          : "bg-white",
      ].join(" ")}
    >
      <div className="flex gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-700">
          {notification.title.charAt(0).toUpperCase()}
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-slate-900">
              {notification.title}
            </h3>

            {!notification.is_read && (
              <span
                className={[
                  "rounded-full border px-2.5 py-1 text-[10px] font-medium",
                  isBlue
                    ? "border-blue-200 bg-blue-50 text-blue-700"
                    : "border-emerald-200 bg-emerald-50 text-emerald-700",
                ].join(" ")}
              >
                New
              </span>
            )}
          </div>

          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
            {notification.message}
          </p>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              {new Date(notification.created_at).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>

            <span
              className={[
                "text-xs font-medium opacity-0 transition-opacity duration-300 group-hover:opacity-100",
                isBlue ? "text-blue-700" : "text-emerald-700",
              ].join(" ")}
            >
              View →
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}