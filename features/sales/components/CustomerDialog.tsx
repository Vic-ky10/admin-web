"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import LoadingButton from "@/components/feedback/LoadingButton";
import { Customer, SalesArea } from "../sales.types";
import { CustomerForm, customerSchema } from "../sales.validation";
import { Employee } from "@/features/employee/employee.types";
import { useEffect } from "react";

interface CustomerDialogProps {
  open: boolean;
  onClose: () => void;
  customer: Customer | null;
  salesAreas: SalesArea[];
  employees: Employee[];
  onSubmit: (values: CustomerForm) => void;
  loading: boolean;
}

const defaultValues: CustomerForm = {
  full_name: "",
  phone: "",
  alternate_phone: "",
  email: "",
  address: "",
  sales_area_id: "",
  assigned_employee_id: "",
  status: "Active",
  notes: "",
};

export default function CustomerDialog({
  open,
  onClose,
  customer,
  salesAreas,
  employees,
  onSubmit,
  loading,
}: CustomerDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CustomerForm>({
    resolver: zodResolver(customerSchema),
    defaultValues,
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
          assigned_employee_id: customer.assigned_employee_id,
          status: customer.status,
          notes: customer.notes || "",
        });
      } else {
        reset(defaultValues);
      }
    }
  }, [open, customer, reset]);

  return (
    <Modal
      open={open}
      title={customer ? "Edit Customer" : "Add Customer"}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Full Name"
            placeholder=" Customer name ..."
            error={errors.full_name?.message}
            {...register("full_name")}
          />
          <Input
            label="Phone"
            type="tel"
            placeholder="Enter Phone no"
            maxLength={10}
            error={errors.phone?.message}
            {...register("phone")}
            onInput={(e) => {
              e.currentTarget.value = e.currentTarget.value
                .replace(/\D/g, "")
                .slice(0, 10);
            }}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Alternate Phone (Optional)"
            type="tel"
            placeholder="Enter phone no..."
            maxLength={10}
            error={errors.alternate_phone?.message}
            {...register("alternate_phone")}
            onInput={(e) => {
              e.currentTarget.value = e.currentTarget.value
                .replace(/\D/g, "")
                .slice(0, 10);
            }}
          />
          <Input
            label="Email (Optional)"
            type="email"
            placeholder="Enter Email .."
            error={errors.email?.message}
            {...register("email")}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">
              Sales Area
            </label>
            <select
              {...register("sales_area_id")}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 text-sm"
            >
              <option value="">Select sales area</option>
              {salesAreas.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.area_name} ({area.area_code})
                </option>
              ))}
            </select>
            {errors.sales_area_id?.message && (
              <p className="text-sm text-red-600">
                {errors.sales_area_id.message}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">
              Assigned Employee
            </label>
            <select
              {...register("assigned_employee_id")}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 text-sm"
            >
              <option value="">Select employee</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.full_name} ({emp.employee_id})
                </option>
              ))}
            </select>
            {errors.assigned_employee_id?.message && (
              <p className="text-sm text-red-600">
                {errors.assigned_employee_id.message}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-semibold text-slate-700">Status</label>
          <select
            {...register("status")}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 text-sm"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Blocked">Blocked</option>
          </select>
          {errors.status?.message && (
            <p className="text-sm text-red-600">{errors.status.message}</p>
          )}
        </div>

        <Input
          label="Address (Optional)"
          placeholder="Enter address details"
          error={errors.address?.message}
          {...register("address")}
        />

        <div className="space-y-1">
          <label className="text-sm font-semibold text-slate-700">
            Notes (Optional)
          </label>
          <textarea
            {...register("notes")}
            rows={3}
            placeholder="Add any customer specific notes..."
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 text-sm"
          />
          {errors.notes?.message && (
            <p className="text-sm text-red-600">{errors.notes.message}</p>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <LoadingButton type="submit" loading={loading}>
            {customer ? "Save Changes" : "Create Customer"}
          </LoadingButton>
        </div>
      </form>
    </Modal>
  );
}
