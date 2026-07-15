"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import LoadingButton from "@/components/feedback/LoadingButton";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

import {
  createExpenseAction,
  updateExpenseAction,
} from "../expense.action";
import {
  EXPENSE_CATEGORY,
  Expense,
} from "../expense.types";
import {
  ExpenseInput,
  expenseSchema,
} from "../expense.validation";

interface ExpenseFormProps {
  expense?: Expense | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const defaultValues: ExpenseInput = {
  expense_type: EXPENSE_CATEGORY.FOOD,
  amount: 0,
  description: "",
  expense_date: "",
  receipt_url: "",
};

export default function ExpenseForm({
  expense,
  onSuccess,
  onCancel,
}: ExpenseFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ExpenseInput>({
    resolver: zodResolver(expenseSchema),
    defaultValues: expense
      ? {
          expense_type: expense.expense_type,
          amount: expense.amount,
          description: expense.description,
          expense_date: expense.expense_date,
          receipt_url: expense.receipt_url ?? "",
        }
      : defaultValues,
  });
  const isEditing = Boolean(expense);

  function onSubmit(values: ExpenseInput) {
    startTransition(async () => {
      const result =
        expense && isEditing
          ? await updateExpenseAction(expense.id, values)
          : await createExpenseAction(values);

      if (!result.success) {
        toast.error(result.error ?? "Unable to save expense.");
        return;
      }

      toast.success(result.message ?? "Expense saved.");
      onSuccess();
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <label className="text-sm font-semibold text-slate-700">
            Category
          </label>
          <select
            {...register("expense_type")}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          >
            {Object.values(EXPENSE_CATEGORY).map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {errors.expense_type?.message && (
            <p className="text-sm text-red-600">
              {errors.expense_type.message}
            </p>
          )}
        </div>

        <Input
          type="number"
          min="0"
          step="0.01"
          label="Amount"
          error={errors.amount?.message}
          {...register("amount", { valueAsNumber: true })}
        />
      </div>

      <Input
        type="date"
        label="Expense Date"
        error={errors.expense_date?.message}
        {...register("expense_date")}
      />

      <Input
        type="url"
        label="Receipt URL"
        placeholder="https://example.com/receipt"
        error={errors.receipt_url?.message}
        {...register("receipt_url")}
      />

      <div className="space-y-1">
        <label className="text-sm font-semibold text-slate-700">
          Description
        </label>
        <textarea
          {...register("description")}
          rows={4}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          placeholder="Describe the expense"
        />
        {errors.description?.message && (
          <p className="text-sm text-red-600">
            {errors.description.message}
          </p>
        )}
      </div>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <LoadingButton type="submit" loading={isPending}>
          {isEditing ? "Update Expense" : "Submit Expense"}
        </LoadingButton>
      </div>
    </form>
  );
}
