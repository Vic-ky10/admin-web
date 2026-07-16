"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import LoadingButton from "@/components/feedback/LoadingButton";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Employee } from "@/features/employee/employee.types";

import {
  INCENTIVE_TYPE,
  IncentiveWithEmployee,
} from "../incentive.types";
import {
  IncentiveInput,
  incentiveSchema,
} from "../incentive.validation";

interface IncentiveFormProps {
  incentive?: IncentiveWithEmployee | null;
  employees: Employee[];
  loading?: boolean;
  onSubmit: (values: IncentiveInput) => void;
  onCancel: () => void;
}

const today = new Date();

const defaultValues: IncentiveInput = {
  profile_id: "",
  incentive_type: INCENTIVE_TYPE.CUSTOMER_CONVERSION,
  title: "",
  description: "",
  amount: 0,
  month: today.getMonth() + 1,
  year: today.getFullYear(),
};

export default function IncentiveForm({
  incentive,
  employees,
  loading = false,
  onSubmit,
  onCancel,
}: IncentiveFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.input<typeof incentiveSchema>, unknown, IncentiveInput>({
    resolver: zodResolver(incentiveSchema),
    defaultValues: incentive
      ? {
          profile_id: incentive.profile_id,
          incentive_type: incentive.incentive_type,
          title: incentive.title,
          description: incentive.description,
          amount: incentive.amount,
          month: incentive.month,
          year: incentive.year,
        }
      : defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <label className="text-sm font-semibold text-slate-700">
            Employee
          </label>
          <select
            {...register("profile_id")}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          >
            <option value="">Select employee</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.full_name} ({employee.employee_id})
              </option>
            ))}
          </select>
          {errors.profile_id?.message && (
            <p className="text-sm text-red-600">
              {errors.profile_id.message}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-semibold text-slate-700">
            Incentive Type
          </label>
          <select
            {...register("incentive_type")}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          >
            {Object.values(INCENTIVE_TYPE).map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {errors.incentive_type?.message && (
            <p className="text-sm text-red-600">
              {errors.incentive_type.message}
            </p>
          )}
        </div>
      </div>

      <Input
        label="Title"
        error={errors.title?.message}
        {...register("title")}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Input
          type="number"
          min="0"
          step="0.01"
          label="Amount"
          error={errors.amount?.message}
          {...register("amount", { valueAsNumber: true })}
        />
        <Input
          type="number"
          min="1"
          max="12"
          label="Month"
          error={errors.month?.message}
          {...register("month", { valueAsNumber: true })}
        />
        <Input
          type="number"
          min="2000"
          label="Year"
          error={errors.year?.message}
          {...register("year", { valueAsNumber: true })}
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-semibold text-slate-700">
          Description
        </label>
        <textarea
          {...register("description")}
          rows={4}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        />
        {errors.description?.message && (
          <p className="text-sm text-red-600">
            {errors.description.message}
          </p>
        )}
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <LoadingButton type="submit" loading={loading}>
          {incentive ? "Update Incentive" : "Create Incentive"}
        </LoadingButton>
      </div>
    </form>
  );
}
