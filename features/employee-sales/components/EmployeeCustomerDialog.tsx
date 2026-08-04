"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import LoadingButton from "@/components/feedback/LoadingButton";
import { Customer, SalesArea } from "@/features/sales/sales.types";
import { CustomerForm, customerSchema } from "@/features/sales/sales.validation";
import { useEffect } from "react";

interface EmployeeCustomerDialogProps {
  open: boolean;
  onClose: () => void;
  customer: Customer | null;
  salesAreas: SalesArea[];
  employeeId: string;
  onSubmit: (values: CustomerForm) => void;
  loading: boolean;
}

const defaultValues = (empId: string): CustomerForm => ({
  full_name: "",
  phone: "",
  alternate_phone: "",
  email: "",
  address: "",
  sales_area_id: "",
  assigned_employee_id: empId,
  status: "Active",
  notes: "",
});

export default function EmployeeCustomerDialog({
  open,
  onClose,
  customer,
  salesAreas,
  employeeId,
  onSubmit,
  loading,
}: EmployeeCustomerDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CustomerForm>({
    resolver: zodResolver(customerSchema),
    defaultValues: defaultValues(employeeId),
  });

  useEffect(() => {
    if (open) {
      if (customer) {
        reset({
          full_name: customer.full_name,
          phone: customer.phone,
          alternate_phone: customer.alternate_phone || "",
          email: customer.email || "",
          address: customer.address || "",
          sales_area_id: customer.sales_area_id,
          assigned_employee_id: employeeId,
          status: customer.status,
          notes: customer.notes || "",
        });
      } else {
        reset(defaultValues(employeeId));
      }
    }
  }, [open, customer, reset, employeeId]);

  return (
    <Modal
      open={open}
      title={customer ? "Edit Customer Info" : "Log New Customer"}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Hidden field to pass assigned_employee_id for Zod Validation */}
        <input type="hidden" {...register("assigned_employee_id")} />

        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Full Name"
            placeholder="Customer name..."
            error={errors.full_name?.message}
            {...register("full_name")}
            className="focus:border-emerald-500 focus:ring-emerald-100"
          />
          <Input
            label="Phone"
            type="tel"
            placeholder="10-digit number"
            maxLength={10}
            error={errors.phone?.message}
            {...register("phone")}
            onInput={(e) => {
              e.currentTarget.value = e.currentTarget.value
                .replace(/\D/g, "")
                .slice(0, 10);
            }}
            className="focus:border-emerald-500 focus:ring-emerald-100"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Alternate Phone (Optional)"
            placeholder="Alternate phone..."
            error={errors.alternate_phone?.message}
            {...register("alternate_phone")}
            className="focus:border-emerald-500 focus:ring-emerald-100"
          />
          <Input
            label="Email (Optional)"
            type="email"
            placeholder="Email address..."
            error={errors.email?.message}
            {...register("email")}
            className="focus:border-emerald-500 focus:ring-emerald-100"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">
              Sales Area
            </label>
            <select
              {...register("sales_area_id")}
              disabled={salesAreas.length === 0}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 text-sm disabled:bg-slate-50 disabled:cursor-not-allowed"
            >
              <option value="">
                {salesAreas.length === 0 ? "No active sales areas available" : "Select sales area"}
              </option>
              {salesAreas.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.area_name} ({area.area_code})
                </option>
              ))}
            </select>
            {salesAreas.length === 0 && (
              <p className="text-xs font-medium text-amber-600">
                No active sales areas available. Please contact your administrator.
              </p>
            )}
            {errors.sales_area_id?.message && (
              <p className="text-sm text-red-600">
                {errors.sales_area_id.message}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">Status</label>
            <select
              {...register("status")}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 text-sm"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Blocked">Blocked</option>
            </select>
            {errors.status?.message && (
              <p className="text-sm text-red-600">{errors.status.message}</p>
            )}
          </div>
        </div>

        <Input
          label="Address (Optional)"
          placeholder="Enter address details"
          error={errors.address?.message}
          {...register("address")}
          className="focus:border-emerald-500 focus:ring-emerald-100"
        />

        <div className="space-y-1">
          <label className="text-sm font-semibold text-slate-700">
            Notes (Optional)
          </label>
          <textarea
            {...register("notes")}
            rows={3}
            placeholder="Add customer specific notes..."
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 text-sm"
          />
          {errors.notes?.message && (
            <p className="text-sm text-red-600">{errors.notes.message}</p>
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
            {customer ? "Save Changes" : "Log Customer"}
          </LoadingButton>
        </div>
      </form>
    </Modal>
  );
}
