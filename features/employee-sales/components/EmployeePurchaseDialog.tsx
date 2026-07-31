"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import LoadingButton from "@/components/feedback/LoadingButton";
import { Customer, CustomerPurchase } from "@/features/sales/sales.types";
import { CustomerPurchaseForm, customerPurchaseSchema } from "@/features/sales/sales.validation";
import { useEffect } from "react";
import { parsePurchaseRemarks } from "@/features/sales/sales.utils";

interface EmployeePurchaseDialogProps {
  open: boolean;
  onClose: () => void;
  purchase: CustomerPurchase | null;
  customers: Customer[];
  onSubmit: (values: CustomerPurchaseForm) => void;
  loading: boolean;
}

const defaultValues: CustomerPurchaseForm = {
  customer_id: "",
  amount: 0,
  purchase_date: "",
  remarks: "",
};

export default function EmployeePurchaseDialog({
  open,
  onClose,
  purchase,
  customers,
  onSubmit,
  loading,
}: EmployeePurchaseDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CustomerPurchaseForm>({
    resolver: zodResolver(customerPurchaseSchema),
    defaultValues,
  });

  useEffect(() => {
    if (open) {
      if (purchase) {
        const formattedDate = purchase.purchase_date
          ? new Date(purchase.purchase_date).toISOString().substring(0, 10)
          : "";

        const meta = parsePurchaseRemarks(purchase.remarks, purchase.status);

        reset({
          customer_id: purchase.customer_id,
          amount: purchase.amount,
          purchase_date: formattedDate,
          remarks: meta.remarks,
        });
      } else {
        reset(defaultValues);
      }
    }
  }, [open, purchase, reset]);

  return (
    <Modal
      open={open}
      title={purchase ? "Edit Purchase Record" : "Log New Purchase"}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-semibold text-slate-700">Customer</label>
          <select
            {...register("customer_id")}
            disabled={!!purchase}
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

        <div className="grid gap-4 md:grid-cols-2">
          <Input
            type="number"
            min="0"
            step="0.01"
            label="Purchase Amount (₹)"
            placeholder="e.g. 15000"
            error={errors.amount?.message}
            {...register("amount", { valueAsNumber: true })}
            className="focus:border-emerald-500 focus:ring-emerald-100"
          />
          <Input
            type="date"
            label="Purchase Date"
            error={errors.purchase_date?.message}
            {...register("purchase_date")}
            className="focus:border-emerald-500 focus:ring-emerald-100"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-semibold text-slate-700">
            Remarks (Optional)
          </label>
          <textarea
            {...register("remarks")}
            rows={3}
            placeholder="Add invoice numbers, items details, or notes..."
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
            {purchase ? "Save Changes" : "Log Purchase"}
          </LoadingButton>
        </div>
      </form>
    </Modal>
  );
}
