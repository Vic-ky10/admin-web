"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import LoadingButton from "@/components/feedback/LoadingButton";

import {
  TaskWithProject,
  TASK_STATUS,
} from "../task.types";

import {
  updateTaskStatusAction,
} from "../task.action";

interface EmployeeTaskStatusModalProps {
  open: boolean;
  task: TaskWithProject | null;
  onClose: () => void;
}

interface FormValues {
  status: string;
  actualHours: number;
}

export default function EmployeeTaskStatusModal({
  open,
  task,
  onClose,
}: EmployeeTaskStatusModalProps) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    reset,
    formState: {
      isSubmitting,
    },
  } = useForm<FormValues>();

    useEffect(() => {
    if (task) {
      reset({
        status: task.status,
        actualHours:
          Number(task.actual_hours) || 0,
      });
    }
  }, [task, reset]);

  async function onSubmit(
    values: FormValues
  ) {
    if (!task) {
      return;
    }

    const result =
      await updateTaskStatusAction(
        task.id,
        values.status,
        values.actualHours
      );

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success(result.message);

    onClose();
    router.refresh();
  }

  if (!task) {
    return null;
  }

  return (
    <Modal
      open={open}
      title="Update Task Status"
      onClose={onClose}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <div>
          <label className="mb-1 block text-sm font-medium">
            Status
          </label>

          <select
            {...register("status")}
            className="w-full rounded-lg border p-2"
          >
            {Object.values(TASK_STATUS).map(
              (status) => (
                <option
                  key={status}
                  value={status}
                >
                  {status}
                </option>
              )
            )}
          </select>
        </div>

        <Input
          label="Actual Hours"
          type="number"
          {...register("actualHours", {
            valueAsNumber: true,
          })}
        />
                <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
          >
            Cancel
          </Button>

          <LoadingButton
            type="submit"
            loading={isSubmitting}
          >
            Update Task
          </LoadingButton>
        </div>
      </form>
    </Modal>
  );
}
