"use server";

import { revalidatePath } from "next/cache";

import { ActionResponse } from "@/types/action";

import {
  deleteEmployeeAccount,
  onboardEmployee,
  updateEmployeeProfile,
} from "./employee.service";
import {
  Employee,
  EmployeeOnboardingResult,
} from "./employee.types";
import {
  EmployeeFormData,
  employeeSchema,
} from "./employee.validation";

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
