import { adminClient } from "@/lib/supabase/admin";
import { ActionResponse } from "@/types/action";

import { IncentiveRule } from "./sales.types";
import { IncentiveRuleForm } from "./sales.validation";

const INCENTIVE_RULE_SELECT =
  "id, minimum_purchase, incentive_amount, status, created_by, created_at, updated_at";

  export async function getIncentiveRules(): Promise<IncentiveRule[]> {
  const { data, error } = await adminClient
    .from("incentive_rules")
    .select(INCENTIVE_RULE_SELECT)
    .order("minimum_purchase", {
      ascending: true,
    });

  if (error) {
    console.error(error);
    return [];
  }

  return data as IncentiveRule[];
}

export async function getIncentiveRuleById(
  id: string
): Promise<IncentiveRule | null> {
  const { data, error } = await adminClient
    .from("incentive_rules")
    .select(INCENTIVE_RULE_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error(error);
    return null;
  }

  return data as IncentiveRule | null;
}

export async function createIncentiveRule(
  rule: IncentiveRuleForm,
  createdBy: string
): Promise<ActionResponse<IncentiveRule>> {
  const { data, error } = await adminClient
    .from("incentive_rules")
    .insert({
      minimum_purchase: rule.minimum_purchase,
      incentive_amount: rule.incentive_amount,
      status: rule.status,
      created_by: createdBy,
    })
    .select(INCENTIVE_RULE_SELECT)
    .single();

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
    message: "Incentive rule created successfully.",
    data: data as IncentiveRule,
  };
}

export async function updateIncentiveRule(
  id: string,
  rule: IncentiveRuleForm
): Promise<ActionResponse<IncentiveRule>> {
  const { data, error } = await adminClient
    .from("incentive_rules")
    .update({
      minimum_purchase: rule.minimum_purchase,
      incentive_amount: rule.incentive_amount,
      status: rule.status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select(INCENTIVE_RULE_SELECT)
    .single();

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
    message: "Incentive rule updated successfully.",
    data: data as IncentiveRule,
  };
}

export async function deleteIncentiveRule(
  id: string
): Promise<ActionResponse> {
  const { error } = await adminClient
    .from("incentive_rules")
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
    message: "Incentive rule deleted successfully.",
  };
}