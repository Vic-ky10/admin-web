"use server";

import { revalidatePath } from "next/cache";

import { ActionResponse } from "@/types/action";

import {
  createIncentive,
  deleteIncentive,
  getAuthenticatedProfileId,
  markIncentivePaid,
  markIncentivePending,
  reviewIncentive,
  updateIncentive,
} from "./incentive.service";
import { Incentive } from "./incentive.types";
import {
  incentiveIdSchema,
  incentiveSchema,
  reviewIncentiveSchema,
  updateIncentiveSchema,
} from "./incentive.validation";

export async function createIncentiveAction(
  values: unknown,
): Promise<ActionResponse<Incentive>> {
  const result = incentiveSchema.safeParse(values);

  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0]?.message ?? "Invalid incentive details.",
    };
  }

  const profileId = await getAuthenticatedProfileId();

  if (!profileId) {
    return {
      success: false,
      error: "Admin profile was not found.",
    };
  }

  const response = await createIncentive(profileId, result.data);

  if (response.success) {
    revalidatePath("/incentives");
    revalidatePath("/employee/incentives");
  }

  return response;
}

export async function updateIncentiveAction(
  incentiveId: string,
  values: unknown,
): Promise<ActionResponse<Incentive>> {
  const idResult = incentiveIdSchema.safeParse({ incentiveId });
  const result = updateIncentiveSchema.safeParse(values);

  if (!idResult.success) {
    return {
      success: false,
      error: idResult.error.issues[0]?.message ?? "Invalid incentive.",
    };
  }

  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0]?.message ?? "Invalid incentive details.",
    };
  }

  const response = await updateIncentive(
    idResult.data.incentiveId,
    result.data,
  );

  if (response.success) {
    revalidatePath("/incentives");
    revalidatePath("/employee/incentives");
  }

  return response;
}

export async function deleteIncentiveAction(
  incentiveId: string,
): Promise<ActionResponse> {
  const result = incentiveIdSchema.safeParse({ incentiveId });

  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0]?.message ?? "Invalid incentive.",
    };
  }

  const response = await deleteIncentive(result.data.incentiveId);

  if (response.success) {
    revalidatePath("/incentives");
    revalidatePath("/employee/incentives");
  }

  return response;
}

export async function reviewIncentiveAction(
  values: unknown,
): Promise<ActionResponse<Incentive>> {
  const result = reviewIncentiveSchema.safeParse(values);

  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0]?.message ?? "Invalid incentive review.",
    };
  }

  const profileId = await getAuthenticatedProfileId();

  if (!profileId) {
    return {
      success: false,
      error: "Admin profile was not found.",
    };
  }

  const response = await reviewIncentive(profileId, result.data);

  if (response.success) {
    revalidatePath("/incentives");
    revalidatePath("/employee/incentives");
  }

  return response;
}

export async function markIncentivePaidAction(
  incentiveId: string,
): Promise<ActionResponse<Incentive>> {
  const result = incentiveIdSchema.safeParse({ incentiveId });

  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0]?.message ?? "Invalid incentive.",
    };
  }

  const profileId = await getAuthenticatedProfileId();

  if (!profileId) {
    return {
      success: false,
      error: "Admin profile was not found.",
    };
  }

  const response = await markIncentivePaid(
    result.data.incentiveId,
    profileId,
  );

  if (response.success) {
    revalidatePath("/incentives");
    revalidatePath("/employee/incentives");
  }

  return response;
}

export async function markIncentivePendingAction(
  incentiveId: string,
): Promise<ActionResponse<Incentive>> {
  const result = incentiveIdSchema.safeParse({ incentiveId });

  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0]?.message ?? "Invalid incentive.",
    };
  }

  const profileId = await getAuthenticatedProfileId();

  if (!profileId) {
    return {
      success: false,
      error: "Admin profile was not found.",
    };
  }

  const response = await markIncentivePending(
    result.data.incentiveId,
    profileId,
  );

  if (response.success) {
    revalidatePath("/incentives");
    revalidatePath("/employee/incentives");
  }

  return response;
}
