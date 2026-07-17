"use client";

import clsx from "clsx";
import {
  BarChart3,
  BriefcaseBusiness,
  CalendarCheck,
  ChevronLeft,
  CreditCard,
  Gift,
  LayoutDashboard,
  ListTodo,
  Megaphone,
  PersonStandingIcon,
  Settings,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dispatch, SetStateAction } from "react";

const adminNavItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Employees", href: "/employees", icon: UsersRound },
  { label: "Attendance", href: "/attendance", icon: CalendarCheck },
  { label: "Projects", href: "/projects", icon: BriefcaseBusiness },
  { label: "Leave", href: "/leave", icon: BarChart3 },
  { label: "Expenses", href: "/expenses", icon: CreditCard },
  { label: "Incentives", href: "/incentives", icon: UserRound
   },
  {
    label: "Tasks",
    href: "/tasks",
    icon: ListTodo,
  },
  {
    label: "Announcements",
    href: "/announcements",
    icon: Megaphone,
  },
  { label: "Profile", href: "/settings", icon: Settings },
];

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: Dispatch<SetStateAction<boolean>>;
  mobileOpen: boolean;
  setMobileOpen: Dispatch<SetStateAction<boolean>>;
}

export default function Sidebar({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}: SidebarProps) {
  return (
    <>
      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-40 hidden border-r border-slate-200 bg-white text-slate-900 shadow-xl shadow-slate-200/60 transition-all duration-300 lg:block",
          collapsed ? "w-20" : "w-72",
        )}
      >
        <SidebarContent
          collapsed={collapsed}
          onCollapse={() => setCollapsed((value) => !value)}
        />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation overlay"
            className="absolute inset-0 bg-slate-950/35 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative h-full w-80 max-w-[86vw] border-r border-slate-200 bg-white text-slate-900 shadow-2xl">
            <SidebarContent
              collapsed={false}
              onNavigate={() => setMobileOpen(false)}
              onClose={() => setMobileOpen(false)}
            />
          </aside>
        </div>
      )}
    </>
  );
}

function SidebarContent({
  collapsed,
  onCollapse,
  onNavigate,
  onClose,
}: {
  collapsed: boolean;
  onCollapse?: () => void;
  onNavigate?: () => void;
  onClose?: () => void;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-20 items-center justify-between border-b border-slate-200 px-5">
        <Link href="/dashboard" className="flex min-w-0 items-center gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-sm font-black text-white shadow-lg shadow-blue-600/25">
            IG
          </span>
          {!collapsed && (
            <span className="min-w-0">
              <span className="block truncate text-lg font-bold">
                InfiniGoal
              </span>
              <span className="block text-xs font-medium text-slate-500">
                Admin Portal
              </span>
            </span>
          )}
        </Link>

        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-blue-300 hover:text-blue-700"
            aria-label="Close navigation"
          >
            <X className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onCollapse}
            className="hidden h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 lg:inline-flex"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronLeft
              className={clsx("h-4 w-4 transition", collapsed && "rotate-180")}
            />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {adminNavItems.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={clsx(
                "group flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold transition-all duration-200",
                collapsed && "justify-center",
                active
                  ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200 shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-950",
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon
                className={clsx(
                  "h-5 w-5 shrink-0 transition-transform group-hover:scale-105",
                  active ? "text-blue-700" : "text-slate-400",
                )}
              />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 p-4">
        <div
          className={clsx(
            "rounded-lg border border-slate-200 bg-slate-50 p-3",
            collapsed && "px-2",
          )}
        >
          <p className="text-center text-xs font-medium text-slate-500">
            {collapsed ? "v1" : "Production Workspace"}
          </p>
        </div>
      </div>
    </div>
  );
}
