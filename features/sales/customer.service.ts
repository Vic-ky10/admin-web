import { adminClient } from "@/lib/supabase/admin";
import { ActionResponse } from "@/types/action";

import {
  CODE_PADDING,
  CUSTOMER_PREFIX,
} from "./sales.constants";

import { Customer } from "./sales.types";
import { CustomerForm } from "./sales.validation";
const CUSTOMER_SELECT =
  "id, customer_code, full_name, phone, alternate_phone, email, address, sales_area_id, assigned_employee_id, status, notes, created_by, created_at, updated_at";

  export async function getCustomers(): Promise<Customer[]> {
  const { data, error } = await adminClient
    .from("customers")
    .select(CUSTOMER_SELECT)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error(error);
    return [];
  }

  return data as Customer[];
}

export async function getCustomerById(
  id: string
): Promise<Customer | null> {
  const { data, error } = await adminClient
    .from("customers")
    .select(CUSTOMER_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error(error);
    return null;
  }

  return data as Customer | null;
}

export async function generateCustomerCode(): Promise<string> {
  const { data, error } = await adminClient
    .from("customers")
    .select("customer_code")
    .like("customer_code", `${CUSTOMER_PREFIX}%`)
    .order("created_at", {
      ascending: false,
    })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error("Unable to generate customer code.");
  }

  if (!data?.customer_code) {
    return formatCustomerCode(1);
  }

  const current = Number(
    data.customer_code.replace(CUSTOMER_PREFIX, "")
  );

  if (Number.isNaN(current)) {
    throw new Error("Latest customer code is invalid.");
  }

  return formatCustomerCode(current + 1);
}

export async function createCustomer(
  customer: CustomerForm,
  createdBy: string
): Promise<ActionResponse<Customer>> {
  const customerCode = await generateCustomerCode();

  const { data, error } = await adminClient
    .from("customers")
    .insert({
      customer_code: customerCode,
      full_name: customer.full_name,
      phone: customer.phone,
      alternate_phone: customer.alternate_phone || null,
      email: customer.email || null,
      address: customer.address || null,
      sales_area_id: customer.sales_area_id,
      assigned_employee_id: customer.assigned_employee_id,
      status: customer.status,
      notes: customer.notes || null,
      created_by: createdBy,
    })
    .select(CUSTOMER_SELECT)
    .single();

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
    message: "Customer created successfully.",
    data: data as Customer,
  };
}

export async function updateCustomer(
  id: string,
  customer: CustomerForm
): Promise<ActionResponse<Customer>> {
  const { data, error } = await adminClient
    .from("customers")
    .update({
      full_name: customer.full_name,
      phone: customer.phone,
      alternate_phone: customer.alternate_phone || null,
      email: customer.email || null,
      address: customer.address || null,
      sales_area_id: customer.sales_area_id,
      assigned_employee_id: customer.assigned_employee_id,
      status: customer.status,
      notes: customer.notes || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select(CUSTOMER_SELECT)
    .single();

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
    message: "Customer updated successfully.",
    data: data as Customer,
  };
}
export async function deleteCustomer(
  id: string
): Promise<ActionResponse> {
  const { error } = await adminClient
    .from("customers")
    .delete()
    .eq("id", id);

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
    message: "Customer deleted successfully.",
  };
}
function formatCustomerCode(value: number) {
  return `${CUSTOMER_PREFIX}${String(value).padStart(
    CODE_PADDING,
    "0"
  )}`;
}