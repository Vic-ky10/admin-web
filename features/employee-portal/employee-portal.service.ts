import { adminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getTodayDate } from "@/features/attendance/attendance.utils";
import { Employee } from "@/features/employee/employee.types";

import { EmployeeDashboardStats } from "./employee-portal.types";

const PROFILE_SELECT =
  "id, employee_id, full_name, email, phone, department, designation, role, avatar_url, status, is_online, last_login, joined_date, created_at, updated_at";

export async function getCurrentEmployeeProfile(): Promise<Employee | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await adminClient
    .from("profiles")
    .select(PROFILE_SELECT)
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.error(error);
    return null;
  }

  return data as Employee | null;
}

export async function getUnreadNotificationCount(profileId: string) {
  const byProfile = await adminClient
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("profile_id", profileId)
    .eq("is_read", false);

  if (!byProfile.error) {
    return byProfile.count ?? 0;
  }

  const byRecipient = await adminClient
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("recipient_id", profileId)
    .eq("is_read", false);

  if (!byRecipient.error) {
    return byRecipient.count ?? 0;
  }

  console.error(byProfile.error);
  return 0;
}

export async function getEmployeeDashboardStats(
  profileId: string
): Promise<EmployeeDashboardStats> {
  const [
    todayAttendance,
    pendingLeaveRequests,
    assignedProjects,
    projectMemberships,
    pendingExpenses,
  ] = await Promise.all([
    adminClient
      .from("attendance")
      .select(
        "id, profile_id, attendance_date, login_time, logout_time, working_hours, status, notes, created_at, updated_at"
      )
      .eq("profile_id", profileId)
      .eq("attendance_date", getTodayDate())
      .maybeSingle(),
    adminClient
      .from("leave_requests")
      .select("id", { count: "exact", head: true })
      .eq("profile_id", profileId)
      .eq("status", "Pending"),
    adminClient
      .from("project_members")
      .select("id", { count: "exact", head: true })
      .eq("profile_id", profileId)
      .eq("status", "Active"),
    adminClient
      .from("project_members")
      .select("id, project_id")
      .eq("profile_id", profileId)
      .eq("status", "Active"),
    adminClient
      .from("expenses")
      .select("id", { count: "exact", head: true })
      .eq("profile_id", profileId)
      .eq("status", "Pending"),
  ]);

  const memberIds =
    projectMemberships.data?.map((member) => member.id) ?? [];
  const projectIds =
    projectMemberships.data?.map((member) => member.project_id) ?? [];

  const pendingTasks =
    memberIds.length > 0
      ? await adminClient
          .from("tasks")
          .select("id", { count: "exact", head: true })
          .in("project_member_id", memberIds)
          .in("status", ["Todo", "In Progress", "In Review"])
      : { count: 0, error: null };
  const [activeProjects, completedProjects] =
    projectIds.length > 0
      ? await Promise.all([
          adminClient
            .from("projects")
            .select("id", { count: "exact", head: true })
            .in("id", projectIds)
            .eq("status", "Active"),
          adminClient
            .from("projects")
            .select("id", { count: "exact", head: true })
            .in("id", projectIds)
            .eq("status", "Completed"),
        ])
      : [
          { count: 0, error: null },
          { count: 0, error: null },
        ];

  for (const response of [
    todayAttendance,
    pendingLeaveRequests,
    assignedProjects,
    projectMemberships,
    pendingExpenses,
    pendingTasks,
    activeProjects,
    completedProjects,
  ]) {
    if (response.error) {
      console.error(response.error);
    }
  }

  return {
    todayAttendance: todayAttendance.data ?? null,
    pendingLeaveRequests: pendingLeaveRequests.count ?? 0,
    assignedProjects: assignedProjects.count ?? 0,
    activeProjects: activeProjects.count ?? 0,
    completedProjects: completedProjects.count ?? 0,
    pendingTasks: pendingTasks.count ?? 0,
    pendingExpenses: pendingExpenses.count ?? 0,
  } as EmployeeDashboardStats;
}
