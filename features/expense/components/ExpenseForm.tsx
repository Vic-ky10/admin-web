"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { ChangeEvent, useRef, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Paperclip, X, File, Loader2 } from "lucide-react";

import { createClient } from "@/lib/supabase/client";

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
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
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
          receipt_name: expense.receipt_name ?? "",
          receipt_size: expense.receipt_size ?? 0,
          receipt_type: expense.receipt_type ?? "",
        }
      : defaultValues,
  });

  const watchedReceiptUrl = watch("receipt_url");
  const watchedReceiptName = watch("receipt_name");
  const watchedReceiptType = watch("receipt_type");
  const isEditing = Boolean(expense);

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const SUPPORTED_FORMATS = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];
    if (!SUPPORTED_FORMATS.includes(file.type)) {
      toast.error("Unsupported format. Please upload JPG, PNG, WEBP, or PDF.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5 MB.");
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split(".").pop()?.toLowerCase() || "pdf";
      const filePath = `receipt-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("expense-receipts")
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      const {
        data: { publicUrl },
      } = supabase.storage .from("expense-receipts").getPublicUrl(filePath);

      setValue("receipt_url", publicUrl);
      setValue("receipt_name", file.name);
      setValue("receipt_size", file.size);
      setValue("receipt_type", file.type);
      setValue("uploaded_at", new Date().toISOString());

      toast.success("Receipt uploaded successfully.");
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Failed to upload receipt.",
      );
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  function removeReceipt() {
    setValue("receipt_url", "");
    setValue("receipt_name", "");
    setValue("receipt_size", null);
    setValue("receipt_type", "");
    setValue("uploaded_at", null);
  }

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

  const isBusy = isPending || uploading;

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

      <div className="space-y-1">
        <label className="text-sm font-semibold text-slate-700">Receipt</label>
        {watchedReceiptUrl ? (
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-white shadow-sm border border-slate-100">
                {watchedReceiptType?.includes("pdf") ||
                watchedReceiptUrl?.toLowerCase().endsWith(".pdf") ? (
                  <File size={20} className="text-blue-500" />
                ) : (
                  <img
                    src={watchedReceiptUrl}
                    alt="Receipt"
                    className="h-full w-full rounded-lg object-cover"
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-900">
                  {watchedReceiptName || "Attached Receipt"}
                </p>
                <p className="text-xs text-slate-500">
                  {watchedReceiptType?.includes("pdf") ||
                  watchedReceiptUrl?.toLowerCase().endsWith(".pdf")
                    ? "PDF Document"
                    : "Image File"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={removeReceipt}
              className="ml-4 rounded-full p-2 text-slate-400 transition hover:bg-slate-200 hover:text-slate-600"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/jpeg,image/png,image/webp,application/pdf"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm font-medium text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Paperclip size={18} className="text-slate-400" />
                  Click to Upload Receipt
                </>
              )}
            </button>
            <p className="mt-2 text-center text-xs text-slate-500">
              Supported formats: JPG, PNG, WEBP, PDF (Max 5MB)
            </p>
          </div>
        )}
      </div>

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
          disabled={isBusy}
          onClick={onCancel}
        >
          Cancel
        </Button>
        <LoadingButton type="submit" loading={isBusy}>
          {isEditing ? "Update Expense" : "Submit Expense"}
        </LoadingButton>
      </div>
    </form>
  );
}
