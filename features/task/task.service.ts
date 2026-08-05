import { adminClient } from "@/lib/supabase/admin";

import { ActionResponse } from "@/types/action";

import { Task, TaskWithProject } from "./task.types";

import { TaskInput, UpdateTaskInput } from "./task.validation";
import { createNotification, notifyAdmins } from "../notification/notification.helper";
import { getCurrentEmployeeProfile } from "../employee-portal/employee-portal.service";


const TASK_SELECT = `
id,
project_id,
project_member_id,
task_code,
title,
description,
priority,
status,
estimated_hours,
actual_hours,
due_date,
completed_at,
created_by,
created_at,
updated_at,

project:projects!tasks_project_id_fkey(
  project_code,
  project_name,
  status
),

member:project_members!tasks_project_member_id_fkey(
  id,
  profile_id,

  profile:profiles!project_members_profile_id_fkey(
    employee_id,
    full_name,
    email,
    department
  )
)
`;

type MaybeArray<T> = T | T[] | null;

type TaskProjectRelation = {
  project_code: string;
  project_name: string;
  status: string;
};

type TaskProfileRelation = {
  employee_id: string;
  full_name: string;
  email: string;
  department: string | null;
};

type TaskMemberRelation = {
  id: string;
  profile_id: string;
  profile: MaybeArray<TaskProfileRelation>;
};

type TaskSelectRow = Task & {
  project: MaybeArray<TaskProjectRelation>;
  member: MaybeArray<TaskMemberRelation>;
};

function firstRelation<T>(relation: MaybeArray<T>): T | null {
  if (Array.isArray(relation)) {
    return relation[0] ?? null;
  }

  return relation;
}

function normalizeTask(row: TaskSelectRow): TaskWithProject {
  const member = firstRelation(row.member);

  return {
    ...row,
    project: firstRelation(row.project),
    member: member
      ? {
          ...member,
          profile: firstRelation(member.profile),
        }
      : null,
  };
}

function normalizeTasks(rows: TaskSelectRow[] | null): TaskWithProject[] {
  return (rows ?? []).map(normalizeTask);
}

async function generateTaskCode() {
  const { data } = await adminClient
    .from("tasks")
    .select("task_code")
    .order("task_code", { ascending: false })
    .limit(1)
    .single();

  if (!data) {
    return "TASK001";
  }

  const lastNumber = parseInt(
    data.task_code.replace("TASK", ""),
    10
  );

  return `TASK${String(lastNumber + 1).padStart(3, "0")}`;
}

 
export async function getAuthenticatedProfileId() {
  const profile = await getCurrentEmployeeProfile();
  return profile?.id ?? null;
}

export async function getTasks(): Promise<TaskWithProject[]> {
  const { data, error } = await adminClient
    .from("tasks")
    .select(TASK_SELECT)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error(error);
    return [];
  }

  return normalizeTasks(data as unknown as TaskSelectRow[]);
}

export async function getEmployeeTasks(
  profileId: string
): Promise<TaskWithProject[]> {
  const { data: memberRecords, error: memberError } = await adminClient
    .from("project_members")
    .select("id")
    .eq("profile_id", profileId);

  if (memberError) {
    console.error(memberError);
    return [];
  }

  const memberIds = memberRecords?.map((m) => m.id) ?? [];

  if (memberIds.length === 0) {
    return [];
  }

  const { data, error } = await adminClient
    .from("tasks")
    .select(TASK_SELECT)
    .in("project_member_id", memberIds)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error(error);
    return [];
  }

  return normalizeTasks(data as unknown as TaskSelectRow[]);
}

export async function getTaskById(id: string): Promise<TaskWithProject | null> {
  const { data, error } = await adminClient
    .from("tasks")
    .select(TASK_SELECT)
    .eq("id", id)
    .single();

  if (error) {
    console.error(error);
    return null;
  }

  return normalizeTask(data as unknown as TaskSelectRow);
}

export async function createTask(
  createdBy: string,
  values: TaskInput,
): Promise<ActionResponse<Task>> {
  const taskCode = await generateTaskCode();

   console.log({
  estimated_hours: values.estimated_hours,
  actual_hours: values.actual_hours,
});
  const { data, error } = await adminClient
    .from("tasks")
    .insert({
      project_id: values.project_id,
      project_member_id: values.project_member_id,
      task_code: taskCode,
      title: values.title,
      description: values.description || null,
      priority: values.priority,
      status: values.status,
      estimated_hours: values.estimated_hours ?? null,
      actual_hours: values.actual_hours ?? null,
      due_date: values.due_date,
      created_by: createdBy,
    })
    .select(TASK_SELECT)
    .single();

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  // Sync project progress
  await syncProjectProgress(values.project_id);

  // notification bell icons
  const { data: member } = await adminClient
    .from("project_members")
    .select("profile_id")
    .eq("id", values.project_member_id)
    .single();

  if (member) {
    await createNotification({
      profileId: member.profile_id,
      title: "New Task Assigned",
      message: `You have been assigned task ${taskCode}.`,
      notificationType: "Task",
      referenceId: data.id,
      actionUrl: "/employee/tasks",
      createdBy,
    });
  }

  return {
    success: true,
    message: "Task created successfully.",
    data: data as Task,
  };
}

export async function updateTask(
  id: string,
  values: UpdateTaskInput,
): Promise<ActionResponse<Task>> {
  const { data, error } = await adminClient
    .from("tasks")
    .update({
      ...values,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select(TASK_SELECT)
    .single();

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  if (data?.project_id) {
    await syncProjectProgress(data.project_id);
  }

  return {
    success: true,
    message: "Task updated successfully.",
    data: data as Task,
  };
}

export async function deleteTask(id: string): Promise<ActionResponse> {
  const { data: currentTask } = await adminClient
    .from("tasks")
    .select("project_id")
    .eq("id", id)
    .single();

  const { error } = await adminClient.from("tasks").delete().eq("id", id);

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  if (currentTask?.project_id) {
    await syncProjectProgress(currentTask.project_id);
  }

  return {
    success: true,
    message: "Task deleted successfully.",
  };
}

export async function updateTaskStatus(
  id: string,
  status: string,
  actualHours?: number,
): Promise<ActionResponse> {
  const updateData: {
    status: string;
    actual_hours?: number;
    completed_at?: string;
    updated_at: string;
  } = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (actualHours !== undefined) {
    updateData.actual_hours = actualHours;
  }

  if (status === "Completed") {
    updateData.completed_at = new Date().toISOString();
    await notifyAdmins({
      title: "Task Completed",
      message: "An employee has completed a task.",
      notificationType: "Task",
    });
  }

  const { data: updatedTask, error } = await adminClient
    .from("tasks")
    .update(updateData)
    .eq("id", id)
    .select("project_id")
    .single();

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  if (updatedTask?.project_id) {
    await syncProjectProgress(updatedTask.project_id);
  }

  return {
    success: true,
    message: "Task updated successfully.",
  };
}

/**
 * Shared synchronization helper to update project completion percentage and lifecycle status
 */
export async function syncProjectProgress(projectId: string): Promise<void> {
  const { data: project, error: projectError } = await adminClient
    .from("projects")
    .select("status")
    .eq("id", projectId)
    .single();

  if (projectError || !project) {
    console.error("syncProjectProgress: Project not found or error", projectError);
    return;
  }

  // Re-evaluation rule: Do not overwrite Cancelled or On Hold
  if (project.status === "Cancelled" || project.status === "On Hold") {
    return;
  }

  const { data: tasks, error: tasksError } = await adminClient
    .from("tasks")
    .select("status")
    .eq("project_id", projectId);

  if (tasksError) {
    console.error("syncProjectProgress: Failed to fetch tasks", tasksError);
    return;
  }

  const totalTasks = tasks?.length || 0;
  const completedTasks = tasks?.filter((t) => t.status === "Completed").length || 0;

  // Formula check
  const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  // Status Lifecycle rules
  let newStatus = project.status;
  if (totalTasks > 0) {
    if (project.status === "Planning") {
      newStatus = "Active";
    }
    if (progress === 100) {
      newStatus = "Completed";
    } else if (progress < 100 && project.status === "Completed") {
      newStatus = "Active";
    }
  } else {
    // If tasks are empty, revert to planning (if active/completed)
    if (project.status === "Active" || project.status === "Completed") {
      newStatus = "Planning";
    }
  }

  const { error: updateError } = await adminClient
    .from("projects")
    .update({
      progress,
      status: newStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", projectId);

  if (updateError) {
    console.error("syncProjectProgress: Update project progress failed", updateError);
  }
}
