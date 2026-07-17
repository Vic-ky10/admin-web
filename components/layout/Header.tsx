"use client";

import { Menu } from "lucide-react";
import NotificationDropdown from "@/features/notification/components/NotificationDropdown";
import { Notification } from "@/features/notification/notification.types";
import { usePathname } from "next/navigation";

import { Employee } from "@/features/employee/employee.types";

interface HeaderProps {
  profile: Employee | null;
  unreadNotifications: number;
  notifications : Notification[]
  onOpenSidebar: () => void;
}

const routeLabels: Record<string, string> = {
  dashboard: "Dashboard",
  employees: "Employees",
  attendance: "Attendance",
  projects: "Projects",
  leave: "Leave",
  expenses: "Expenses",
  settings: "Settings",
};

export default function Header({
  profile,
  unreadNotifications,
  notifications,
  onOpenSidebar,
}: HeaderProps) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const current = segments[0] ?? "dashboard";
  const currentLabel = routeLabels[current] ?? "Admin";
  const initials = (profile?.full_name ?? profile?.email ?? "Admin")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 px-4 py-4 shadow-sm backdrop-blur sm:px-6 lg:px-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-blue-300 hover:text-blue-700 lg:hidden"
            onClick={onOpenSidebar}
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="min-w-0">
            <nav className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <span>Admin</span>
              <span>/</span>
              <span className="truncate text-blue-700">{currentLabel}</span>
            </nav>
            <h2 className="mt-1 truncate text-xl font-semibold text-slate-950">
              {currentLabel}
            </h2>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
         <NotificationDropdown
  notifications={notifications}
  unreadCount={unreadNotifications}
/>

          <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-2 py-1.5 shadow-sm">
            {profile?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatar_url}
                alt=""
                className="h-9 w-9 rounded-full object-cover"
              />
            ) : (
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                {initials || "AD"}
              </span>
            )}
            <span className="hidden text-left sm:block">
              <span className="block max-w-40 truncate text-sm font-semibold text-slate-900">
                {profile?.full_name ?? "Admin"}
              </span>
              <span className="block max-w-40 truncate text-xs text-slate-500">
                {profile?.email ?? "admin"}
              </span>
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
