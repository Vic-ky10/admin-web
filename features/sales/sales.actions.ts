"use server";

import { revalidatePath } from "next/cache";

function revalidateSales() {
  revalidatePath("/sales");
  revalidatePath("/employee/sales");
  revalidatePath("/dashboard");
  revalidatePath("/employee/dashboard");
}


import {
  createSalesArea,
  updateSalesArea,
  deleteSalesArea,
} from "./sales-area.service";

import {
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "./customer.service";

import {
  createCustomerPurchase,
  updateCustomerPurchase,
  deleteCustomerPurchase,
} from "./customer-purchase.service";

import {
  createCustomerFollowup,
  updateCustomerFollowup,
  deleteCustomerFollowup,
} from "./customer-followup.service";

import {
  createIncentiveRule,
  updateIncentiveRule,
  deleteIncentiveRule,
} from "./incentive-rule.service";

import {
  SalesAreaForm,
  CustomerForm,
  CustomerPurchaseForm,
  CustomerFollowupForm,
  IncentiveRuleForm,
} from "./sales.validation";
import { getAuthenticatedProfileId } from "../expense/expense.service";


export async function createSalesAreaAction(values: SalesAreaForm) {
  const profileId = await getAuthenticatedProfileId();

  if (!profileId) {
    return {
      success: false,
      error: "Profile not found.",
    };
  }

  const result = await createSalesArea(values, profileId);

  if (result.success) {
    revalidateSales();
  }

  return result;
}

export async function updateSalesAreaAction(
  id: string,
  values: SalesAreaForm
) {
  const result = await updateSalesArea(id, values);

  if (result.success) {
    revalidateSales();
  }

  return result;
}

export async function deleteSalesAreaAction(id: string) {
  const result = await deleteSalesArea(id);

  if (result.success) {
    revalidateSales();
  }

  return result;
}

export async function createCustomerAction(values: CustomerForm) {
  const profileId = await getAuthenticatedProfileId();

  if (!profileId) {
    return {
      success: false,
      error: "Profile not found.",
    };
  }

  const result = await createCustomer(values, profileId);

  if (result.success) {
    revalidateSales();
  }

  return result;
}

export async function updateCustomerAction(
  id: string,
  values: CustomerForm
) {
  const result = await updateCustomer(id, values);

  if (result.success) {
    revalidateSales();
  }

  return result;
}

export async function deleteCustomerAction(id: string) {
  const result = await deleteCustomer(id);

  if (result.success) {
    revalidateSales();
  }

  return result;
}

export async function createCustomerPurchaseAction(
  values: CustomerPurchaseForm
) {
  const profileId = await getAuthenticatedProfileId();

  if (!profileId) {
    return {
      success: false,
      error: "Profile not found.",
    };
  }

  const result = await createCustomerPurchase(values, profileId);

  if (result.success) {
    revalidateSales();
  }

  return result;
}

export async function updateCustomerPurchaseAction(
  id: string,
  values: CustomerPurchaseForm
) {
  const profileId = await getAuthenticatedProfileId();
  const result = await updateCustomerPurchase(id, values, profileId || undefined);

  if (result.success) {
    revalidateSales();
  }

  return result;
}

export async function deleteCustomerPurchaseAction(id: string) {
  const result = await deleteCustomerPurchase(id);

  if (result.success) {
    revalidateSales();
  }

  return result;
}

export async function createCustomerFollowupAction(
  values: CustomerFollowupForm
) {
  const profileId = await getAuthenticatedProfileId();

  if (!profileId) {
    return {
      success: false,
      error: "Profile not found.",
    };
  }

  const result = await createCustomerFollowup(values, profileId);

  if (result.success) {
    revalidateSales();
  }

  return result;
}

export async function updateCustomerFollowupAction(
  id: string,
  values: CustomerFollowupForm
) {
  const result = await updateCustomerFollowup(id, values);

  if (result.success) {
    revalidateSales();
  }

  return result;
}

export async function deleteCustomerFollowupAction(id: string) {
  const result = await deleteCustomerFollowup(id);

  if (result.success) {
    revalidateSales();
  }

  return result;
}

export async function createIncentiveRuleAction(
  values: IncentiveRuleForm
) {
  const profileId = await getAuthenticatedProfileId();

  if (!profileId) {
    return {
      success: false,
      error: "Profile not found.",
    };
  }

  const result = await createIncentiveRule(values, profileId);

  if (result.success) {
    revalidateSales();
  }

  return result;
}

export async function updateIncentiveRuleAction(
  id: string,
  values: IncentiveRuleForm
) {
  const result = await updateIncentiveRule(id, values);

  if (result.success) {
    revalidateSales();
  }

  return result;
}

export async function deleteIncentiveRuleAction(id: string) {
  const result = await deleteIncentiveRule(id);

  if (result.success) {
    revalidateSales();
  }

  return result;
}