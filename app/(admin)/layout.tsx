import Link from "next/link";
import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen">

      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white">

        <div className="border-b border-slate-700 p-6">
          <h1 className="text-2xl font-bold">
            InfiniGoal
          </h1>
        </div>

        <nav className="p-4 space-y-2">

          <Link
            href="/dashboard"
            className="block rounded-lg p-3 hover:bg-slate-800"
          >
            Dashboard
          </Link>

          <Link
            href="/employees"
            className="block rounded-lg p-3 hover:bg-slate-800"
          >
            Employees
          </Link>

          <Link
            href="/attendance"
            className="block rounded-lg p-3 hover:bg-slate-800"
          >
            Attendance
          </Link>

          <Link
            href="/projects"
            className="block rounded-lg p-3 hover:bg-slate-800"
          >
            Projects
          </Link>

          <Link
            href="/leave"
            className="block rounded-lg p-3 hover:bg-slate-800"
          >
            Leave
          </Link>

          <Link
            href="/expenses"
            className="block rounded-lg p-3 hover:bg-slate-800"
          >
            Expenses
          </Link>

          <Link
            href="/settings"
            className="block rounded-lg p-3 hover:bg-slate-800"
          >
            Settings
          </Link>

        </nav>

      </aside>

      {/* Main Content */}
      <div className="flex-1">

        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b bg-white px-8">

          <h2 className="text-xl font-semibold">
            Admin Portal
          </h2>

          <div>
            Admin
          </div>

        </header>

        {/* Page Content */}
        <main className="p-8">
          {children} {/* Current page (Dashboard, Employees...) renders here */}
        </main>

      </div>

    </div>
  );
}