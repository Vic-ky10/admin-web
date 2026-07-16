"use server";

import { revalidatePath } from "next/cache";

import { ActionResponse } from "@/types/action";

import {
  archiveProject,
  assignProjectMembers,
  createProject,
  getAuthenticatedProfileId,
  getProjectMembers,
  removeProjectMember,
  updateProject,
} from "./project.service";
import { Project, ProjectMember } from "./project.types";
import {
  assignProjectMembersSchema,
  projectIdSchema,
  projectSchema,
  removeProjectMemberSchema,
} from "./project.validation";



export async function getProjectMembersAction(
  projectId: string
) {
  return await getProjectMembers(projectId);
}

export async function createProjectAction(
  values: unknown
): Promise<ActionResponse<Project>> {
  const result = projectSchema.safeParse(values);

  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0]?.message ?? "Invalid project details.",
    };
  }

  const profileId = await getAuthenticatedProfileId();

  if (!profileId) {
    return {
      success: false,
      error: "Admin profile was not found.",
    };
  }

  const response = await createProject(profileId, result.data);

  if (response.success) {
    revalidateProjectPaths();
  }

  return response;
}

export async function updateProjectAction(
  projectId: string,
  values: unknown
): Promise<ActionResponse<Project>> {
  const idResult = projectIdSchema.safeParse({ projectId });
  const result = projectSchema.safeParse(values);

  if (!idResult.success) {
    return {
      success: false,
      error: idResult.error.issues[0]?.message ?? "Invalid project.",
    };
  }

  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0]?.message ?? "Invalid project details.",
    };
  }

  const response = await updateProject(idResult.data.projectId, result.data);

  if (response.success) {
    revalidateProjectPaths();
  }

  return response;
}

export async function archiveProjectAction(
  values: unknown
): Promise<ActionResponse<Project>> {
  const result = projectIdSchema.safeParse(values);

  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0]?.message ?? "Invalid project.",
    };
  }

  const response = await archiveProject(result.data.projectId);

  if (response.success) {
    revalidateProjectPaths();
  }

  return response;
}

export async function assignProjectMembersAction(
  values: unknown
): Promise<ActionResponse<ProjectMember[]>> {
  const result = assignProjectMembersSchema.safeParse(values);

  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0]?.message ?? "Invalid member assignment.",
    };
  }

  const profileId = await getAuthenticatedProfileId();

  if (!profileId) {
    return {
      success: false,
      error: "Admin profile was not found.",
    };
  }

  const response = await assignProjectMembers(profileId, result.data);

  if (response.success) {
    revalidateProjectPaths();
  }

  return response;
}

export async function removeProjectMemberAction(
  values: unknown
): Promise<ActionResponse<ProjectMember>> {
  const result = removeProjectMemberSchema.safeParse(values);

  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0]?.message ?? "Invalid project member.",
    };
  }

  const response = await removeProjectMember(result.data.projectMemberId);

  if (response.success) {
    revalidateProjectPaths();
  }

  return response;
}

function revalidateProjectPaths() {
  revalidatePath("/projects");
  revalidatePath("/dashboard");
  revalidatePath("/employee/projects");
  revalidatePath("/employee/dashboard");
}
