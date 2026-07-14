import Link from "next/link";
import { redirect } from "next/navigation";

import Badge from "@/components/ui/Badge";
import {
  getCurrentEmployeeProfile,
  getEmployeeDashboardStats,
} from "@/features/employee-portal/employee-portal.service";

export const dynamic = "force-dynamic";

export default async function EmployeeDashboardPage() {
  const profile = await getCurrentEmployeeProfile();

  if (!profile) {
    redirect("/employee/login");
  }

  const stats = await getEmployeeDashboardStats(profile.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="mt-1 text-slate-500">
          Welcome back, {profile.full_name}.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <DashboardCard
          label="Today's Attendance"
          value={
            stats.todayAttendance ? (
              <Badge variant="success">{stats.todayAttendance.status}</Badge>
            ) : (
              "No record"
            )
          }
          href="/employee/attendance"
        />
        <DashboardCard
          label="Pending Leave Requests"
          value={stats.pendingLeaveRequests}
          href="/employee/leave?status=Pending"
        />
        <DashboardCard
          label="My Projects"
          value={stats.assignedProjects}
          href="/employee/projects"
        />
        <DashboardCard
          label="Active Projects"
          value={stats.activeProjects}
          href="/employee/projects"
        />
        <DashboardCard
          label="Completed Projects"
          value={stats.completedProjects}
          href="/employee/projects"
        />
        <DashboardCard
          label="Pending Tasks"
          value={stats.pendingTasks}
          href="/employee/tasks"
        />
        <DashboardCard
          label="Pending Expenses"
          value={stats.pendingExpenses}
          href="/employee/expenses"
        />
      </div>
    </div>
  );
}

function DashboardCard({
  label,
  value,
  href,
}: {
  label: string;
  value: React.ReactNode;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-300 hover:shadow"
    >
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <div className="mt-3 text-2xl font-semibold text-slate-900">
        {value}
      </div>
    </Link>
  );
}
