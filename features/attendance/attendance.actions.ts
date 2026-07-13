"use server";

import { revalidatePath } from "next/cache";

import { ActionResponse } from "@/types/action";

import {
  getCurrentProfileId,
  loginAttendance,
  logoutAttendance,
} from "./attendance.service";
import { Attendance } from "./attendance.types";
import { attendanceNotesSchema } from "./attendance.validation";

export async function loginAttendanceAction(
  values: unknown
): Promise<ActionResponse<Attendance>> {
  const result = attendanceNotesSchema.safeParse(values);

  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0]?.message ?? "Invalid attendance details.",
    };
  }

  const profileId = await getCurrentProfileId();

  if (!profileId) {
    return {
      success: false,
      error: "Employee profile was not found.",
    };
  }

  const response = await loginAttendance(
    profileId,
    result.data.notes
  );

  if (response.success) {
    revalidatePath("/employee/attendance");
    revalidatePath("/attendance");
  }

  return response;
}

export async function logoutAttendanceAction(): Promise<
  ActionResponse<Attendance>
> {
  const profileId = await getCurrentProfileId();

  if (!profileId) {
    return {
      success: false,
      error: "Employee profile was not found.",
    };
  }

  const response = await logoutAttendance(profileId);

  if (response.success) {
    revalidatePath("/employee/attendance");
    revalidatePath("/attendance");
  }

  return response;
}
