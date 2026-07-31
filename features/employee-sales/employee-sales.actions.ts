"use server";

import { revalidatePath } from "next/cache";
import { ActionResponse } from "@/types/action";
import { getCurrentEmployeeProfile } from "@/features/employee-portal/employee-portal.service";

function revalidateSales() {
  revalidatePath("/sales");
  revalidatePath("/employee/sales");
  revalidatePath("/dashboard");
  revalidatePath("/employee/dashboard");
}

import {
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerById,
} from "@/features/sales/customer.service";

import {
  createCustomerPurchase,
  updateCustomerPurchase,
  deleteCustomerPurchase,
  getCustomerPurchaseById,
} from "@/features/sales/customer-purchase.service";

import {
  createCustomerFollowup,
  updateCustomerFollowup,
  deleteCustomerFollowup,
  getCustomerFollowupById,
} from "@/features/sales/customer-followup.service";

import {
  CustomerForm,
  CustomerPurchaseForm,
  CustomerFollowupForm,
} from "@/features/sales/sales.validation";

// Helper to get current profile or error
async function getProfileOrError() {
  const profile = await getCurrentEmployeeProfile();
  if (!profile) {
    throw new Error("Unauthorized or profile not found.");
  }
  return profile;
}

// Scoping checks for permissions validation
async function assertCustomerBelongsToEmployee(customerId: string, employeeId: string) {
  const customer = await getCustomerById(customerId);
  if (!customer || customer.assigned_employee_id !== employeeId) {
    throw new Error("Access Denied: Customer not assigned to you.");
  }
  return customer;
}

async function assertPurchaseBelongsToEmployee(purchaseId: string, employeeId: string) {
  const purchase = await getCustomerPurchaseById(purchaseId);
  if (!purchase) {
    throw new Error("Access Denied: Purchase record not found.");
  }
  await assertCustomerBelongsToEmployee(purchase.customer_id, employeeId);
  return purchase;
}

async function assertFollowupBelongsToEmployee(followupId: string, employeeId: string) {
  const followup = await getCustomerFollowupById(followupId);
  if (!followup) {
    throw new Error("Access Denied: Followup record not found.");
  }
  await assertCustomerBelongsToEmployee(followup.customer_id, employeeId);
  return followup;
}

// CUSTOMERS
export async function createEmployeeCustomerAction(values: CustomerForm): Promise<ActionResponse> {
  try {
    const profile = await getProfileOrError();

    // Force assignments to logged in employee
    const scopedValues: CustomerForm = {
      ...values,
      assigned_employee_id: profile.id,
    };

    const res = await createCustomer(scopedValues, profile.id);
    if (res.success) {
      revalidateSales();
    }
    return res;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unexpected error occurred.";
    return { success: false, error: message };
  }
}

export async function updateEmployeeCustomerAction(id: string, values: CustomerForm): Promise<ActionResponse> {
  try {
    const profile = await getProfileOrError();
    await assertCustomerBelongsToEmployee(id, profile.id);

    // Force assignments to logged in employee
    const scopedValues: CustomerForm = {
      ...values,
      assigned_employee_id: profile.id,
    };

    const res = await updateCustomer(id, scopedValues);
    if (res.success) {
      revalidateSales();
    }
    return res;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unexpected error occurred.";
    return { success: false, error: message };
  }
}

export async function deleteEmployeeCustomerAction(id: string): Promise<ActionResponse> {
  try {
    const profile = await getProfileOrError();
    await assertCustomerBelongsToEmployee(id, profile.id);

    const res = await deleteCustomer(id);
    if (res.success) {
      revalidateSales();
    }
    return res;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unexpected error occurred.";
    return { success: false, error: message };
  }
}

// PURCHASES
export async function createEmployeePurchaseAction(values: CustomerPurchaseForm): Promise<ActionResponse> {
  try {
    const profile = await getProfileOrError();
    await assertCustomerBelongsToEmployee(values.customer_id, profile.id);

    const res = await createCustomerPurchase(values, profile.id);
    if (res.success) {
      revalidateSales();
    }
    return res;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unexpected error occurred.";
    return { success: false, error: message };
  }
}

export async function updateEmployeePurchaseAction(id: string, values: CustomerPurchaseForm): Promise<ActionResponse> {
  try {
    const profile = await getProfileOrError();
    await assertPurchaseBelongsToEmployee(id, profile.id);
    await assertCustomerBelongsToEmployee(values.customer_id, profile.id);

    const res = await updateCustomerPurchase(id, values);
    if (res.success) {
      revalidateSales();
    }
    return res;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unexpected error occurred.";
    return { success: false, error: message };
  }
}

export async function deleteEmployeePurchaseAction(id: string): Promise<ActionResponse> {
  try {
    const profile = await getProfileOrError();
    await assertPurchaseBelongsToEmployee(id, profile.id);

    const res = await deleteCustomerPurchase(id);
    if (res.success) {
      revalidateSales();
    }
    return res;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unexpected error occurred.";
    return { success: false, error: message };
  }
}

// FOLLOWUPS
export async function createEmployeeFollowupAction(values: CustomerFollowupForm): Promise<ActionResponse> {
  try {
    const profile = await getProfileOrError();
    await assertCustomerBelongsToEmployee(values.customer_id, profile.id);

    const res = await createCustomerFollowup(values, profile.id);
    if (res.success) {
      revalidateSales();
    }
    return res;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unexpected error occurred.";
    return { success: false, error: message };
  }
}

export async function updateEmployeeFollowupAction(id: string, values: CustomerFollowupForm): Promise<ActionResponse> {
  try {
    const profile = await getProfileOrError();
    await assertFollowupBelongsToEmployee(id, profile.id);
    await assertCustomerBelongsToEmployee(values.customer_id, profile.id);

    const res = await updateCustomerFollowup(id, values);
    if (res.success) {
      revalidateSales();
    }
    return res;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unexpected error occurred.";
    return { success: false, error: message };
  }
}

export async function deleteEmployeeFollowupAction(id: string): Promise<ActionResponse> {
  try {
    const profile = await getProfileOrError();
    await assertFollowupBelongsToEmployee(id, profile.id);

    const res = await deleteCustomerFollowup(id);
    if (res.success) {
      revalidateSales();
    }
    return res;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unexpected error occurred.";
    return { success: false, error: message };
  }
}
