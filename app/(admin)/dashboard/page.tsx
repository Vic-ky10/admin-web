import Link from "next/link";
import { redirect } from "next/navigation";
import {
  BriefcaseBusiness,
  CalendarCheck,
  CreditCard,
  UsersRound,
} from "lucide-react";

import { getTodayDate } from "@/features/attendance/attendance.utils";
import { getProjectDashboardStats } from "@/features/project/project.service";
import { adminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [
    employeeCount,
    todayAttendanceCount,
    pendingLeaveCount,
    pendingExpenseCount,
    projectStats,
  ] = await Promise.all([
    adminClient.from("profiles").select("id", { count: "exact", head: true }),
    adminClient
      .from("attendance")
      .select("id", { count: "exact", head: true })
      .eq("attendance_date", getTodayDate()),
    adminClient
      .from("leave_requests")
      .select("id", { count: "exact", head: true })
      .eq("status", "Pending"),
    adminClient
      .from("expenses")
      .select("id", { count: "exact", head: true })
      .eq("status", "Pending"),
    getProjectDashboardStats(),
  ]);

  for (const response of [
    employeeCount,
    todayAttendanceCount,
    pendingLeaveCount,
    pendingExpenseCount,
  ]) {
    if (response.error) {
      console.error(response.error);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
            Overview
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">
            Admin Dashboard
          </h1>
          <p className="mt-2 text-slate-500">Welcome, {user.email}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <DashboardCard
          label="Employees"
          value={employeeCount.count ?? 0}
          href="/employees"
          icon={<UsersRound className="h-5 w-5" />}
        />
        <DashboardCard
          label="Attendance"
          value={todayAttendanceCount.count ?? 0}
          href="/attendance"
          icon={<CalendarCheck className="h-5 w-5" />}
        />
        <DashboardCard
          label="Active Projects"
          value={projectStats.activeProjects}
          href="/projects"
          icon={<BriefcaseBusiness className="h-5 w-5" />}
        />
        <DashboardCard
          label="Pending Leave"
          value={pendingLeaveCount.count ?? 0}
          href="/leave?status=Pending"
          icon={<CalendarCheck className="h-5 w-5" />}
        />
        <DashboardCard
          label="Expenses"
          value={pendingExpenseCount.count ?? 0}
          href="/expenses"
          icon={<CreditCard className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        <ProjectStat label="Total Projects" value={projectStats.totalProjects} />
        <ProjectStat
          label="Active Projects"
          value={projectStats.activeProjects}
        />
        <ProjectStat
          label="Completed Projects"
          value={projectStats.completedProjects}
        />
        <ProjectStat
          label="Archived Projects"
          value={projectStats.archivedProjects}
        />
      </div>
    </div>
  );
}

function DashboardCard({
  label,
  value,
  href,
  icon,
}: {
  label: string;
  value: number;
  href: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-100/70"
    >
      <div className="flex items-center justify-between">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700 ring-1 ring-blue-100">
          {icon}
        </span>
      </div>
      <p className="mt-5 text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-slate-950">{value}</p>
    </Link>
  );
}

function ProjectStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-3 text-2xl font-bold text-slate-950">{value}</p>
    </div>
  );
}
