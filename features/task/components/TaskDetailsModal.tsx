"use client";

import Modal from "@/components/ui/Modal";

import { TaskWithProject } from "../task.types";

import TaskPriorityBadge from "./TaskPriorityBadge";
import TaskStatusBadge from "./TaskStatusBadge";

interface TaskDetailsModalProps {
  task: TaskWithProject | null;
  open: boolean;
  onClose: () => void;
}

export default function TaskDetailsModal({
  task,
  open,
  onClose,
}: TaskDetailsModalProps) {
  if (!task) {
    return null;
  }

  return (
    <Modal open={open} title="Task Details" onClose={onClose}>
      <div className="grid gap-5 md:grid-cols-2">
        <DetailItem label="Task Code" value={task.task_code} />

        <DetailItem label="Task Title" value={task.title} />

        <DetailItem
          label="Project"
          value={task.project?.project_name ?? "-"}
        />

        <DetailItem
          label="Project Code"
          value={task.project?.project_code ?? "-"}
        />

        <DetailItem
          label="Employee"
          value={task.member?.profile?.full_name ?? "-"}
        />

        <DetailItem
          label="Employee ID"
          value={task.member?.profile?.employee_id ?? "-"}
        />

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Priority
          </p>

          <div className="mt-3">
            <TaskPriorityBadge priority={task.priority} />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Status
          </p>

          <div className="mt-3">
            <TaskStatusBadge status={task.status} />
          </div>
        </div>

        <DetailItem
          label="Estimated Hours"
          value={task.estimated_hours?.toString() ?? "-"}
        />

        <DetailItem
          label="Actual Hours"
          value={task.actual_hours?.toString() ?? "-"}
        />

        <DetailItem
          label="Due Date"
          value={task.due_date ?? "-"}
        />

        <DetailItem
          label="Completed At"
          value={task.completed_at ?? "-"}
        />

        <div className="md:col-span-2">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Description
          </p>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="whitespace-pre-line leading-7 text-slate-700">
              {task.description || "No description available."}
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-2 break-words text-[15px] font-semibold text-slate-900">
        {value || "Not available"}
      </p>
    </div>
  );
}