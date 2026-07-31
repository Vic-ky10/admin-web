"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import LoadingButton from "@/components/feedback/LoadingButton";
import { IncentiveRule } from "../sales.types";
import { IncentiveRuleForm, incentiveRuleSchema } from "../sales.validation";
import { useEffect } from "react";

interface IncentiveRuleDialogProps {
  open: boolean;
  onClose: () => void;
  rule: IncentiveRule | null;
  onSubmit: (values: IncentiveRuleForm) => void;
  loading: boolean;
}

const defaultValues: IncentiveRuleForm = {
  minimum_purchase: 0,
  incentive_amount: 0,
  status: "Active",
};

export default function IncentiveRuleDialog({
  open,
  onClose,
  rule,
  onSubmit,
  loading,
}: IncentiveRuleDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<IncentiveRuleForm>({
    resolver: zodResolver(incentiveRuleSchema),
    defaultValues,
  });

  useEffect(() => {
    if (open) {
      if (rule) {
        reset({
          minimum_purchase: rule.minimum_purchase,
          incentive_amount: rule.incentive_amount,
          status: rule.status,
        });
      } else {
        reset(defaultValues);
      }
    }
  }, [open, rule, reset]);

  return (
    <Modal
      open={open}
      title={rule ? "Edit Incentive Rule" : "Create Incentive Rule"}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          type="number"
          min="0"
          step="0.01"
          label="Minimum Target Purchase (₹)"
          placeholder="e.g. 50000"
          error={errors.minimum_purchase?.message}
          {...register("minimum_purchase", { valueAsNumber: true })}
        />

        <Input
          type="number"
          min="0"
          step="0.01"
          label="Incentive / Commission Amount (₹)"
          placeholder="e.g. 1500"
          error={errors.incentive_amount?.message}
          {...register("incentive_amount", { valueAsNumber: true })}
        />

        <div className="space-y-1">
          <label className="text-sm font-semibold text-slate-700">Status</label>
          <select
            {...register("status")}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 text-sm"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          {errors.status?.message && (
            <p className="text-sm text-red-600">{errors.status.message}</p>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <LoadingButton type="submit" loading={loading}>
            {rule ? "Save Changes" : "Create Rule"}
          </LoadingButton>
        </div>
      </form>
    </Modal>
  );
}
