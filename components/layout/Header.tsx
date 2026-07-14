"use client";

import { Bell, CheckCircle2, Menu, Search } from "lucide-react";
import { usePathname } from "next/navigation";

import { Employee } from "@/features/employee/employee.types";

interface HeaderProps {
  profile: Employee | null;
  unreadNotifications: number;
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

        <div className="hidden min-w-0 flex-1 justify-center px-6 md:flex">
          <label className="relative w-full max-w-xl">
            <span className="sr-only">Search admin portal</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Search people, projects, attendance..."
              className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
          </label>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <details className="relative">
            <summary
              className="relative inline-flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-blue-300 hover:text-blue-700 hover:shadow"
              aria-label={`${unreadNotifications} unread notifications`}
            >
              <Bell className="h-5 w-5" />
              {unreadNotifications > 0 && (
                <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-bold text-white">
                  {unreadNotifications}
                </span>
              )}
            </summary>
            <div className="absolute right-0 mt-2 w-80 rounded-lg border border-slate-200 bg-white p-3 shadow-xl shadow-slate-900/10">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <p className="font-semibold text-slate-900">Notifications</p>
                <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">
                  {unreadNotifications} unread
                </span>
              </div>
              <div className="py-4 text-center">
                <span className="mx-auto inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                  <CheckCircle2 className="h-5 w-5" />
                </span>
                <p className="mt-3 text-sm font-medium text-slate-900">
                  Notification center ready
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  New project, leave, attendance, and expense alerts appear here.
                </p>
              </div>
            </div>
          </details>

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
