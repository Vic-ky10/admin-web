"use server";

import { revalidatePath } from "next/cache";

import { ActionResponse } from "@/types/action";

import {
  cancelPendingLeaveRequest,
  createLeaveRequest,
  getAuthenticatedProfileId,
  reviewLeaveRequest,
} from "./leave.service";
import { LeaveRequest } from "./leave.types";
import {
  cancelLeaveSchema,
  leaveRequestSchema,
  reviewLeaveSchema,
} from "./leave.validation";

export async function applyLeaveAction(
  values: unknown
): Promise<ActionResponse<LeaveRequest>> {
  const result = leaveRequestSchema.safeParse(values);

  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0]?.message ?? "Invalid leave request.",
    };
  }

  const profileId = await getAuthenticatedProfileId();

  if (!profileId) {
    return {
      success: false,
      error: "Employee profile was not found.",
    };
  }

  const response = await createLeaveRequest(profileId, result.data);

  if (response.success) {
    revalidatePath("/employee/leave");
    revalidatePath("/employee/dashboard");
    revalidatePath("/leave");
  }

  return response;
}

export async function cancelLeaveAction(
  values: unknown
): Promise<ActionResponse<LeaveRequest>> {
  const result = cancelLeaveSchema.safeParse(values);

  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0]?.message ?? "Invalid leave request.",
    };
  }

  const profileId = await getAuthenticatedProfileId();

  if (!profileId) {
    return {
      success: false,
      error: "Employee profile was not found.",
    };
  }

  const response = await cancelPendingLeaveRequest(
    profileId,
    result.data.leaveRequestId
  );

  if (response.success) {
    revalidatePath("/employee/leave");
    revalidatePath("/employee/dashboard");
    revalidatePath("/leave");
  }

  return response;
}

export async function reviewLeaveAction(
  values: unknown
): Promise<ActionResponse<LeaveRequest>> {
  const result = reviewLeaveSchema.safeParse(values);

  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0]?.message ?? "Invalid review details.",
    };
  }

  const reviewerId = await getAuthenticatedProfileId();

  if (!reviewerId) {
    return {
      success: false,
      error: "Reviewer profile was not found.",
    };
  }

  const response = await reviewLeaveRequest(reviewerId, result.data);

  if (response.success) {
    revalidatePath("/leave");
    revalidatePath("/employee/leave");
    revalidatePath("/employee/dashboard");
  }

  return response;
}
