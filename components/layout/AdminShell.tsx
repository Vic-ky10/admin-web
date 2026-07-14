"use client";

import clsx from "clsx";
import { ReactNode, useState } from "react";

import { Employee } from "@/features/employee/employee.types";

import Header from "./Header";
import Sidebar from "./Sidebar";

interface AdminShellProps {
  profile: Employee | null;
  unreadNotifications: number;
  children: ReactNode;
}

export default function AdminShell({
  profile,
  unreadNotifications,
  children,
}: AdminShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <div
        className={clsx(
          "min-h-screen transition-all duration-300",
          collapsed ? "lg:pl-20" : "lg:pl-72"
        )}
      >
        <Header
          profile={profile}
          unreadNotifications={unreadNotifications}
          onOpenSidebar={() => setMobileOpen(true)}
        />

        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
