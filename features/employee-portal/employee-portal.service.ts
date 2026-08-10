import { adminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getTodayDate } from "@/features/attendance/attendance.utils";
import { Employee } from "@/features/employee/employee.types";
import { TOTAL_DEFAULT_LEAVE_ALLOWANCE } from "@/features/leave/leave.types";

import { EmployeeDashboardStats } from "./employee-portal.types";

const PROFILE_SELECT =
  "id, employee_id, full_name, email, phone, department, designation, role, avatar_url, status, is_online, last_login, joined_date, date_of_birth, current_address, qualification, degree, experience_years, emergency_contact, created_at, updated_at";

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

  return data as unknown as Employee | null;
}

export async function getCurrentEmployeeProfileFromToken(
  token: string
): Promise<Employee | null> {
  const {
    data: { user },
    error,
  } = await adminClient.auth.getUser(token);




  

  if (error || !user) {
    console.error(error);
    return null;
  }

  const { data, error: profileError } = await adminClient
    .from("profiles")
    .select(PROFILE_SELECT)
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error(profileError);
    return null;
  }



  return data as Employee | null;
}
import { unstable_noStore as noStore } from "next/cache";

export async function getUnreadNotificationCount(profileId: string) {
  noStore();
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
    approvedLeaves,
    unreadNotifications,
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
    adminClient
      .from("leave_requests")
      .select("total_days")
      .eq("profile_id", profileId)
      .eq("status", "Approved")
      .gte("start_date", `${new Date().getFullYear()}-01-01`),
    getUnreadNotificationCount(profileId),
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
    approvedLeaves,
  ]) {
    if (response.error) {
      console.error(response.error);
    }
  }

  const approvedDaysSum =
    approvedLeaves.data?.reduce(
      (sum, item) => sum + Number(item.total_days || 0),
      0
    ) ?? 0;
  const leaveBalance = Math.max(
    0,
    TOTAL_DEFAULT_LEAVE_ALLOWANCE - approvedDaysSum
  );

  return {
    todayAttendance: todayAttendance.data ?? null,
    pendingLeaveRequests: pendingLeaveRequests.count ?? 0,
    assignedProjects: assignedProjects.count ?? 0,
    activeProjects: activeProjects.count ?? 0,
    completedProjects: completedProjects.count ?? 0,
    pendingTasks: pendingTasks.count ?? 0,
    pendingExpenses: pendingExpenses.count ?? 0,
    leaveBalance,
    unreadNotifications,
  } as EmployeeDashboardStats;
}

export interface EmployeeActivity {
  id: string;
  type: "Leave" | "Expense" | "Attendance" | "Task" | "Incentive";
  title: string;
  description: string;
  status?: string;
  createdAt: string;
}

export async function getEmployeeRecentActivity(
  profileId: string
): Promise<EmployeeActivity[]> {
  const leavesPromise = adminClient
    .from("leave_requests")
    .select("id, leave_type, status, total_days, created_at")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false })
    .limit(5);

  const expensesPromise = adminClient
    .from("expenses")
    .select("id, title, amount, status, created_at")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false })
    .limit(5);

  const incentivesPromise = adminClient
    .from("incentives")
    .select("id, title, amount, status, created_at")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false })
    .limit(5);

  const membersRes = await adminClient
    .from("project_members")
    .select("id")
    .eq("profile_id", profileId);

  const memberIds = membersRes.data?.map((m) => m.id) ?? [];

  const tasksPromise =
    memberIds.length > 0
      ? adminClient
          .from("tasks")
          .select("id, title, status, created_at")
          .in("project_member_id", memberIds)
          .order("created_at", { ascending: false })
          .limit(5)
      : Promise.resolve({ data: [] });

  const [leavesRes, expensesRes, incentivesRes, tasksRes] = await Promise.all([
    leavesPromise,
    expensesPromise,
    incentivesPromise,
    tasksPromise,
  ]);

  const activities: EmployeeActivity[] = [];

  (leavesRes.data ?? []).forEach((item) => {
    activities.push({
      id: item.id,
      type: "Leave",
      title: `${item.leave_type} Requested`,
      description: `${item.total_days} day(s) requested (${item.status})`,
      status: item.status,
      createdAt: item.created_at,
    });
  });

  (expensesRes.data ?? []).forEach((item) => {
    activities.push({
      id: item.id,
      type: "Expense",
      title: `Expense Claim Submitted`,
      description: `${item.title} - ₹${item.amount} (${item.status})`,
      status: item.status,
      createdAt: item.created_at,
    });
  });

  (incentivesRes.data ?? []).forEach((item) => {
    activities.push({
      id: item.id,
      type: "Incentive",
      title: `Incentive Reward`,
      description: `${item.title} - ₹${item.amount} (${item.status})`,
      status: item.status,
      createdAt: item.created_at,
    });
  });

  (tasksRes.data ?? []).forEach((item) => {
    activities.push({
      id: item.id,
      type: "Task",
      title: `Task Assignment`,
      description: `${item.title} (${item.status})`,
      status: item.status,
      createdAt: item.created_at,
    });
  });

  return activities
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 5);
}
