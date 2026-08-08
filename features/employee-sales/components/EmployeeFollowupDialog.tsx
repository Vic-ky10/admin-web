"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import LoadingButton from "@/components/feedback/LoadingButton";
import { Customer, CustomerFollowup } from "@/features/sales/sales.types";
import { CustomerFollowupForm, customerFollowupSchema } from "@/features/sales/sales.validation";
import { FOLLOWUP_TYPES } from "@/features/sales/sales.constants";
import { useEffect } from "react";

interface EmployeeFollowupDialogProps {
  open: boolean;
  onClose: () => void;
  followup: CustomerFollowup | null;
  customers: Customer[];
  onSubmit: (values: CustomerFollowupForm) => void;
  loading: boolean;
}

const defaultValues: CustomerFollowupForm = {
  customer_id: "",
  followup_date: new Date().toISOString().substring(0, 10),
  followup_type: "Call",
  remarks: "",
  next_followup_date: "",
};

export default function EmployeeFollowupDialog({
  open,
  onClose,
  followup,
  customers,
  onSubmit,
  loading,
}: EmployeeFollowupDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CustomerFollowupForm>({
    resolver: zodResolver(customerFollowupSchema),
    defaultValues,
  });

  useEffect(() => {
    if (open) {
      if (followup) {
        const formattedDate = followup.followup_date
          ? new Date(followup.followup_date).toISOString().substring(0, 10)
          : "";
        const formattedNextDate = followup.next_followup_date
          ? new Date(followup.next_followup_date).toISOString().substring(0, 10)
          : "";

        reset({
          customer_id: followup.customer_id,
          followup_date: formattedDate,
          followup_type: followup.followup_type,
          remarks: followup.remarks || "",
          next_followup_date: formattedNextDate,
        });
      } else {
        reset(defaultValues);
      }
    }
  }, [open, followup, reset]);

  return (
    <Modal
      open={open}
      title={followup ? "Reschedule / Edit Follow-up" : "Log Customer Interaction"}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-semibold text-slate-700">Customer</label>
          <select
            {...register("customer_id")}
            disabled={!!followup}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 text-sm disabled:bg-slate-50 disabled:cursor-not-allowed"
          >
            <option value="">Select customer</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.full_name} ({c.customer_code})
              </option>
            ))}
          </select>
          {errors.customer_id?.message && (
            <p className="text-sm text-red-600">{errors.customer_id.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            Interaction Type
          </label>
          <select
            {...register("followup_type")}
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-slate-900 shadow-xs outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 text-sm"
          >
            {Object.values(FOLLOWUP_TYPES).map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {errors.followup_type?.message && (
            <p className="text-sm text-red-600">{errors.followup_type.message}</p>
          )}
        </div>

        <Input
          type="date"
          label="Next Scheduled Follow-up"
          helperText="When should you contact this customer again?"
          error={errors.next_followup_date?.message}
          {...register("next_followup_date")}
          className="focus:border-emerald-500 focus:ring-emerald-100"
        />

        <div className="space-y-1">
          <label className="text-sm font-semibold text-slate-700">
            Interaction Details / Remarks
          </label>
          <textarea
            {...register("remarks")}
            rows={4}
            placeholder="Summarize the client discussion, interests, or requests..."
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 text-sm"
          />
          {errors.remarks?.message && (
            <p className="text-sm text-red-600">{errors.remarks.message}</p>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="secondary" onClick={onClose} className="border-slate-200 text-slate-700 hover:bg-slate-50">
            Cancel
          </Button>
          <LoadingButton
            type="submit"
            loading={loading}
            className="bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-emerald-600/20"
          >
            {followup ? "Save Changes" : "Log Follow-up"}
          </LoadingButton>
        </div>
      </form>
    </Modal>
  );
}
