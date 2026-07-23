"use client";
import NotificationDropdown from "@/features/notification/components/NotificationDropdown";
import { Notification } from "@/features/notification/notification.types";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {

  BriefcaseBusiness,
  CalendarCheck,
  ClipboardList,
  CreditCard,
  Gift,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  TrendingUp,
  UserRound,
  X,
} from "lucide-react";
import { ReactNode, useState } from "react";
import clsx from "clsx";

import Button from "@/components/ui/Button";
import { logout } from "@/features/auth/auth.service";
import { Employee } from "@/features/employee/employee.types";

const employeeNavItems = [
  { label: "Dashboard", href: "/employee/dashboard", icon: LayoutDashboard },
  { label: "Attendance", href: "/employee/attendance", icon: CalendarCheck },
  { label: "Leave Management", href: "/employee/leave", icon: ClipboardList },
  { label: "Projects", href: "/employee/projects", icon: BriefcaseBusiness },
  { label: "My Tasks", href: "/employee/tasks", icon: ClipboardList },
  { label: "My Expenses", href: "/employee/expenses", icon: CreditCard },
  { label: "Expense Tracker", href: "/employee/expense-tracker", icon: TrendingUp },
  { label: "Incentives", href: "/employee/incentives", icon: Gift },
  { label: "Announcements", href: "/employee/announcements", icon: Megaphone },
  { label: "Profile", href: "/employee/profile", icon: UserRound },
];

interface EmployeeShellProps {
  profile: Employee;
  unreadNotifications: number;
  notifications: Notification[];
  children: ReactNode;
}

export default function EmployeeShell({
  profile,
  unreadNotifications,
  notifications,
  children,
}: EmployeeShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const initials = profile.full_name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  async function handleLogout() {
    await logout();
    router.push("/employee/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-slate-200 bg-white lg:block">
        <EmployeeSidebar pathname={pathname} onLogout={handleLogout} />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation overlay"
            className="absolute inset-0 bg-slate-900/50"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative h-full w-80 max-w-[85vw] border-r border-slate-200 bg-white">
            <EmployeeSidebar
              pathname={pathname}
              onNavigate={() => setMobileOpen(false)}
              onLogout={handleLogout}
            />
          </aside>
        </div>
      )}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between border-b border-slate-200 bg-white px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <p className="text-sm font-medium text-slate-500">
                Employee Portal
              </p>
              <h1 className="text-lg font-semibold sm:text-xl">InfiniGoal</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <NotificationDropdown
              notifications={notifications}
              unreadCount={unreadNotifications}
            />

            <details className="relative">
              <summary className="flex cursor-pointer list-none items-center gap-3 rounded-lg border border-slate-200 px-2 py-1.5">
                {profile.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.avatar_url}
                    alt=""
                    className="h-9 w-9 rounded-full object-cover"
                  />
                ) : (
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                    {initials || "IG"}
                  </span>
                )}
                <span className="hidden text-left md:block">
                  <span className="block text-sm font-semibold">
                    {profile.full_name}
                  </span>
                  <span className="block text-xs text-slate-500">
                    {profile.employee_id} •{" "}
                    {profile.department ?? "No department"}
                  </span>
                </span>
              </summary>
              <div className="absolute right-0 mt-2 w-64 rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
                <p className="font-semibold">{profile.full_name}</p>
                <p className="text-sm text-slate-500">{profile.email}</p>
                <p className="mt-2 text-sm text-slate-600">
                  {profile.employee_id} •{" "}
                  {profile.department ?? "No department"}
                </p>
                <div className="mt-3 grid gap-2">
                  <Link
                    href="/employee/profile"
                    className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-slate-100"
                  >
                    Profile
                  </Link>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleLogout}
                    className="w-full justify-center"
                  >
                    Logout
                  </Button>
                </div>
              </div>
            </details>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

function EmployeeSidebar({
  pathname,
  onNavigate,
  onLogout,
}: {
  pathname: string;
  onNavigate?: () => void;
  onLogout: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between border-b border-slate-200 px-6">
        <Link href="/employee/dashboard" className="text-xl font-bold">
          InfiniGoal
        </Link>
        {onNavigate && (
          <button
            type="button"
            onClick={onNavigate}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 lg:hidden"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {employeeNavItems.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={clsx(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
                active
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-slate-700 hover:bg-slate-100",
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 p-4">
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-700 hover:bg-red-50"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  );
}
