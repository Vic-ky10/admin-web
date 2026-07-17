"use server";

import { revalidatePath } from "next/cache";

import { ActionResponse } from "@/types/action";

import {
  deleteEmployeeAccount,
  onboardEmployee,
  updateEmployeeProfile,
  updateSelfProfile,
} from "./employee.service";
import {
  Employee,
  EmployeeOnboardingResult,
} from "./employee.types";
import {
  EmployeeFormData,
  employeeSchema,
  profileSchema,
  ProfileFormData,
} from "./employee.validation";
import { getCurrentEmployeeProfile } from "../employee-portal/employee-portal.service";

export async function createEmployee(
  values: EmployeeFormData
): Promise<ActionResponse<EmployeeOnboardingResult>> {
  const result = employeeSchema.safeParse(values);

  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0]?.message ?? "Invalid employee details.",
    };
  }

  try {
    const response = await onboardEmployee(result.data);

    if (response.success) {
      revalidatePath("/employees");
    }

    return response;
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Unable to create employee.",
    };
  }
}

export async function updateEmployee(
  employeeId: string,
  values: EmployeeFormData
): Promise<ActionResponse<Employee>> {
  const result = employeeSchema.safeParse(values);

  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0]?.message ?? "Invalid employee details.",
    };
  }

  try {
    const response = await updateEmployeeProfile(
      employeeId,
      result.data
    );

    if (response.success) {
      revalidatePath("/employees");
    }

    return response;
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Unable to update employee.",
    };
  }
}

export async function deleteEmployee(
  employeeId: string
): Promise<ActionResponse> {
  try {
    const response = await deleteEmployeeAccount(employeeId);

    if (response.success) {
      revalidatePath("/employees");
    }

    return response;
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Unable to delete employee.",
    };
  }
}

export async function updateSelfProfileAction(
  values: ProfileFormData
): Promise<ActionResponse<Employee>> {
  const profile = await getCurrentEmployeeProfile();
  if (!profile) {
    return {
      success: false,
      error: "You must be authenticated to perform this action.",
    };
  }

  const result = profileSchema.safeParse(values);
  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0]?.message ?? "Invalid profile details.",
    };
  }

  try {
    const response = await updateSelfProfile(
      profile.id,
      result.data.full_name,
      result.data.phone || null,
      result.data.avatar_url || null
    );

    if (response.success) {
      revalidatePath("/employee/profile");
      revalidatePath("/settings");
      revalidatePath("/dashboard");
      revalidatePath("/employee/dashboard");
    }

    return response;
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Unable to update profile.",
    };
  }
}
