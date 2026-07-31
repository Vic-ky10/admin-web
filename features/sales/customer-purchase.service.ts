import { adminClient } from "@/lib/supabase/admin";
import { ActionResponse } from "@/types/action";
import {
  CODE_PADDING,
  PURCHASE_PREFIX,
  PURCHASE_STATUS,
} from "./sales.constants";

import { CustomerPurchase, IncentiveRule } from "./sales.types";
import { CustomerPurchaseForm } from "./sales.validation";

const CUSTOMER_PURCHASE_SELECT =
  "id, purchase_code, customer_id, amount, purchase_date, incentive_amount, status, remarks, created_by, created_at, updated_at";

  export async function getCustomerPurchases(): Promise<CustomerPurchase[]> {
  const { data, error } = await adminClient
    .from("customer_purchases")
    .select(CUSTOMER_PURCHASE_SELECT)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error(error);
    return [];
  }

  return data as CustomerPurchase[];
}
export async function getCustomerPurchaseById(
  id: string
): Promise<CustomerPurchase | null> {
  const { data, error } = await adminClient
    .from("customer_purchases")
    .select(CUSTOMER_PURCHASE_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error(error);
    return null;
  }

  return data as CustomerPurchase | null;
}

export async function generatePurchaseCode(): Promise<string> {
  const { data, error } = await adminClient
    .from("customer_purchases")
    .select("purchase_code")
    .like("purchase_code", `${PURCHASE_PREFIX}%`)
    .order("created_at", {
      ascending: false,
    })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error("Unable to generate purchase code.");
  }

  if (!data?.purchase_code) {
    return formatPurchaseCode(1);
  }

  const current = Number(
    data.purchase_code.replace(PURCHASE_PREFIX, "")
  );

  if (Number.isNaN(current)) {
    throw new Error("Latest purchase code is invalid.");
  }

  return formatPurchaseCode(current + 1);
}
async function getActiveIncentiveRule(): Promise<IncentiveRule | null> {
  const { data, error } = await adminClient
    .from("incentive_rules")
    .select("*")
    .eq("status", "Active")
    .order("minimum_purchase", {
      ascending: false,
    })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as IncentiveRule | null;
}

export async function createCustomerPurchase(
  purchase: CustomerPurchaseForm,
  createdBy: string
): Promise<ActionResponse<CustomerPurchase>> {
  const purchaseCode = await generatePurchaseCode();

  const rule = await getActiveIncentiveRule();

  let incentiveAmount = 0;
let status: CustomerPurchase["status"] =
  PURCHASE_STATUS.NOT_ELIGIBLE;

  if (
    rule &&
    purchase.amount >= rule.minimum_purchase
  ) {
    incentiveAmount = rule.incentive_amount;
    status = PURCHASE_STATUS.PENDING;
  }

  const { data, error } = await adminClient
    .from("customer_purchases")
    .insert({
      purchase_code: purchaseCode,
      customer_id: purchase.customer_id,
      amount: purchase.amount,
      purchase_date: purchase.purchase_date,
      incentive_amount: incentiveAmount,
      status,
      remarks: purchase.remarks || null,
      created_by: createdBy,
    })
    .select(CUSTOMER_PURCHASE_SELECT)
    .single();

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
    message: "Customer purchase created successfully.",
    data: data as CustomerPurchase,
  };
}

export async function updateCustomerPurchase(
  id: string,
  purchase: CustomerPurchaseForm
): Promise<ActionResponse<CustomerPurchase>> {
  const rule = await getActiveIncentiveRule();

  let incentiveAmount = 0;
  let status: CustomerPurchase["status"] =
  PURCHASE_STATUS.NOT_ELIGIBLE;

  if (
    rule &&
    purchase.amount >= rule.minimum_purchase
  ) {
    incentiveAmount = rule.incentive_amount;
    status = PURCHASE_STATUS.PENDING;
  }

  const { data, error } = await adminClient
    .from("customer_purchases")
    .update({
      customer_id: purchase.customer_id,
      amount: purchase.amount,
      purchase_date: purchase.purchase_date,
      incentive_amount: incentiveAmount,
      status,
      remarks: purchase.remarks || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select(CUSTOMER_PURCHASE_SELECT)
    .single();

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
    message: "Customer purchase updated successfully.",
    data: data as CustomerPurchase,
  };
}

export async function deleteCustomerPurchase(
  id: string
): Promise<ActionResponse> {
  const { error } = await adminClient
    .from("customer_purchases")
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
    message: "Customer purchase deleted successfully.",
  };
}

function formatPurchaseCode(value: number) {
  return `${PURCHASE_PREFIX}${String(value).padStart(
    CODE_PADDING,
    "0"
  )}`;
}