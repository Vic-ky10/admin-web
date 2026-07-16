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
      <div className="grid gap-4 md:grid-cols-2">
        <DetailItem label="Task Code" value={task.task_code} />

        <DetailItem label="Task Title" value={task.title} />

        <DetailItem label="Project" value={task.project?.project_name ?? "-"} />

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

        <div>
          <p className="text-sm font-medium text-slate-500">Priority</p>

          <div className="mt-1">
            <TaskPriorityBadge priority={task.priority} />
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-slate-500">Status</p>

          <div className="mt-1">
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

        <DetailItem label="Due Date" value={task.due_date ?? "-"} />

        <DetailItem label="Completed At" value={task.completed_at ?? "-"} />

        <div className="md:col-span-2">
          <p className="text-sm font-medium text-slate-500">Description</p>

          <p className="mt-1 whitespace-pre-line rounded-lg bg-slate-50 p-3 text-slate-800">
            {task.description || "No description"}
          </p>
        </div>
      </div>
    </Modal>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm font-medium text-slate-500">{label}</p>

      <p className="mt-1 font-semibold text-slate-900">{value}</p>
    </div>
  );
}
