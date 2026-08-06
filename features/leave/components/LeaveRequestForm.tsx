"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import LoadingButton from "@/components/feedback/LoadingButton";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

import { applyLeaveAction } from "../leave.actions";
import {
  HALF_DAY_SESSION,
  LEAVE_DURATION,
  LEAVE_TYPE,
} from "../leave.types";
import {
  LeaveRequestInput,
  leaveRequestSchema,
} from "../leave.validation";
import { calculateLeaveDays } from "../leave.utils";

interface LeaveRequestFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const defaultValues: LeaveRequestInput = {
  leave_type: LEAVE_TYPE.CASUAL,
  leave_duration: LEAVE_DURATION.FULL_DAY,
  half_day_session: "",
  start_date: "",
  end_date: "",
  reason: "",
};

export default function LeaveRequestForm({
  onSuccess,
  onCancel,
}: LeaveRequestFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<LeaveRequestInput>({
    resolver: zodResolver(leaveRequestSchema),
    defaultValues,
  });
  const values = useWatch({ control });
  const totalDays = useMemo(
    () =>
      calculateLeaveDays({
        leave_duration:
          values.leave_duration ?? LEAVE_DURATION.FULL_DAY,
        start_date: values.start_date ?? "",
        end_date: values.end_date ?? "",
      }),
    [values]
  );
  const isHalfDay =
    values.leave_duration === LEAVE_DURATION.HALF_DAY;

  function onSubmit(formValues: LeaveRequestInput) {
    startTransition(async () => {
      const result = await applyLeaveAction(formValues);

      if (!result.success) {
        toast.error(result.error ?? "Unable to apply leave.");
        return;
      }

      toast.success(result.message ?? "Leave request submitted.");
      onSuccess();
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <label className="text-sm font-medium">Leave Type</label>
          <select
            {...register("leave_type")}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-500 focus:outline-none"
          >
            {Object.values(LEAVE_TYPE).map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {errors.leave_type?.message && (
            <p className="text-sm text-red-500">
              {errors.leave_type.message}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Leave Duration</label>
          <select
            {...register("leave_duration")}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-500 focus:outline-none"
          >
            {Object.values(LEAVE_DURATION).map((duration) => (
              <option key={duration} value={duration}>
                {duration}
              </option>
            ))}
          </select>
          {errors.leave_duration?.message && (
            <p className="text-sm text-red-500">
              {errors.leave_duration.message}
            </p>
          )}
        </div>
      </div>

      {isHalfDay && (
        <div className="space-y-1">
          <label className="text-sm font-medium">Half Day Session</label>
          <select
            {...register("half_day_session")}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-500 focus:outline-none"
          >
            <option value="">Select session</option>
            {Object.values(HALF_DAY_SESSION).map((session) => (
              <option key={session} value={session}>
                {session}
              </option>
            ))}
          </select>
          {errors.half_day_session?.message && (
            <p className="text-sm text-red-500">
              {errors.half_day_session.message}
            </p>
          )}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Input
          type="date"
          label="Start Date"
          error={errors.start_date?.message}
          {...register("start_date")}
        />
        <Input
          type="date"
          label="End Date"
          error={errors.end_date?.message}
          {...register("end_date")}
        />
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <p className="text-sm font-medium text-slate-500">Total Days</p>
        <p className="mt-1 text-xl font-semibold text-slate-900">
          {totalDays > 0 ? totalDays : "Select dates"}
        </p>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Reason</label>
        <textarea
          {...register("reason")}
          rows={4}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-500 focus:outline-none"
          placeholder="Enter leave reason"
        />
        {errors.reason?.message && (
          <p className="text-sm text-red-500">
            {errors.reason.message}
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
          Submit Leave
        </LoadingButton>
      </div>
    </form>
  );
}
