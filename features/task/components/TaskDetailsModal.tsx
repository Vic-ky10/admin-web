// "use client";

// import Modal from "@/components/ui/Modal";

// import { TaskWithProject } from "../task.types";

// import TaskPriorityBadge from "./TaskPriorityBadge";
// import TaskStatusBadge from "./TaskStatusBadge";

// interface TaskDetailsModalProps {
//   task: TaskWithProject | null;
//   open: boolean;
//   onClose: () => void;
// }

// export default function TaskDetailsModal({
//   task,
//   open,
//   onClose,
// }: TaskDetailsModalProps) {
//   if (!task) return null;

//   return (
//     <Modal
//       open={open}
//       size="2xl"
//       title="Task Details"
//       subtitle="View complete information about this task"
//       onClose={onClose}
//     >
//       <div className="space-y-7">
//         <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
//           <DetailItem label="Task Code" value={task.task_code} />

//           <DetailItem label="Task Title" value={task.title} />

//           <DetailItem
//             label="Project"
//             value={task.project?.project_name ?? "-"}
//           />

//           <DetailItem
//             label="Project Code"
//             value={task.project?.project_code ?? "-"}
//           />

//           <DetailItem
//             label="Assigned Employee"
//             value={task.member?.profile?.full_name ?? "-"}
//           />

//           <DetailItem
//             label="Employee ID"
//             value={task.member?.profile?.employee_id ?? "-"}
//           />

//           <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 shadow-sm">
//             <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
//               Priority
//             </p>

//             <div className="mt-4">
//               <TaskPriorityBadge priority={task.priority} />
//             </div>
//           </div>

//           <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 shadow-sm">
//             <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
//               Status
//             </p>

//             <div className="mt-4">
//               <TaskStatusBadge status={task.status} />
//             </div>
//           </div>

//           <DetailItem
//             label="Estimated Hours"
//             value={task.estimated_hours?.toString() ?? "-"}
//           />

//           <DetailItem
//             label="Actual Hours"
//             value={task.actual_hours?.toString() ?? "-"}
//           />

//           <DetailItem
//             label="Due Date"
//             value={task.due_date ?? "-"}
//           />

//           <DetailItem
//             label="Completed At"
//             value={
//               task.completed_at
//                 ? new Date(task.completed_at).toLocaleString("en-IN", {
//                     day: "2-digit",
//                     month: "short",
//                     year: "numeric",
//                     hour: "2-digit",
//                     minute: "2-digit",
//                   })
//                 : "-"
//             }
//           />
//         </div>

//         <div className="border-t border-slate-200 pt-6">
//           <h3 className="mb-3 text-base font-bold text-slate-900">
//             Task Description
//           </h3>

//           <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-6 shadow-sm">
//             <p className="whitespace-pre-line text-[15px] leading-8 text-slate-700">
//               {task.description || "No description available."}
//             </p>
//           </div>
//         </div>
//       </div>
//     </Modal>
//   );
// }

// function DetailItem({
//   label,
//   value,
// }: {
//   label: string;
//   value: string;
// }) {
//   return (
//     <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:shadow-md">
//       <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
//         {label}
//       </p>

//       <p className="mt-3 break-words text-base font-semibold text-slate-900 md:text-lg">
//         {value || "Not available"}
//       </p>
//     </div>
//   );
// }

"use client";

import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  ClipboardList,
  FolderKanban,
  Hash,
  UserRound,
  Edit2,
  Trash2,
} from "lucide-react";

import Modal from "@/components/ui/Modal";

import { TaskWithProject } from "../task.types";

import TaskPriorityBadge from "./TaskPriorityBadge";
import TaskStatusBadge from "./TaskStatusBadge";

interface TaskDetailsModalProps {
  task: TaskWithProject | null;
  open: boolean;
  isAdmin?: boolean;
  onEdit?: (task: TaskWithProject) => void;
  onDelete?: (task: TaskWithProject) => void;
  onClose: () => void;
}

export default function TaskDetailsModal({
  task,
  open,
  isAdmin,
  onEdit,
  onDelete,
  onClose,
}: TaskDetailsModalProps) {
  if (!task) return null;

  const completedAt = task.completed_at
    ? new Date(task.completed_at).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";

  return (
    <Modal
      open={open}
      size="xl"
      title="Task Details"
      subtitle="View complete information about this task"
      onClose={onClose}
    >
      <div className="space-y-6">

        {/* Hero Card */}

        <div className="overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-r from-blue-50 via-indigo-50 to-violet-50 shadow-sm">
          <div className="p-6">

            <div className="flex flex-wrap items-start justify-between gap-5">

              <div>
                <div className="flex items-center gap-3">
                  <span className="inline-flex rounded-full bg-blue-600 px-3 py-1 text-xs font-bold tracking-wider text-white">
                    {task.task_code}
                  </span>
                  
                  {isAdmin && (
                    <div className="flex items-center gap-1 ml-2">
                      {onEdit && (
                        <button
                          type="button"
                          onClick={() => onEdit(task)}
                          className="p-1.5 text-blue-600/60 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          title="Edit Task"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          type="button"
                          onClick={() => onDelete(task)}
                          className="p-1.5 text-rose-500/60 hover:text-rose-600 hover:bg-rose-100 rounded-lg transition-colors"
                          title="Delete Task"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <h2 className="mt-4 text-2xl font-bold text-slate-900">
                  {task.title}
                </h2>

                <p className="mt-2 text-sm text-slate-600">
                  Assigned task information and work progress.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <TaskPriorityBadge priority={task.priority} />
                <TaskStatusBadge status={task.status} />
              </div>

            </div>
          </div>
        </div>

                {/*  task Information  */}

        <div>
          <div className="mb-5 flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-bold text-slate-900">
              Task Information
            </h3>
          </div>

          <div className="grid gap-5 md:grid-cols-2">

            <InfoCard
              icon={
                <FolderKanban className="h-5 w-5 text-blue-600" />
              }
              label="Project"
              value={task.project?.project_name ?? "-"}
              color="blue"
            />

            <InfoCard
              icon={
                <Hash className="h-5 w-5 text-indigo-600" />
              }
              label="Project Code"
              value={task.project?.project_code ?? "-"}
              color="indigo"
            />

            <InfoCard
              icon={
                <UserRound className="h-5 w-5 text-emerald-600" />
              }
              label="Assigned Employee"
              value={task.member?.profile?.full_name ?? "-"}
              color="emerald"
            />

            <InfoCard
              icon={
                <Hash className="h-5 w-5 text-cyan-600" />
              }
              label="Employee ID"
              value={task.member?.profile?.employee_id ?? "-"}
              color="cyan"
            />

          </div>
        </div>

        {/*  Work Details  */}

        <div className="border-t border-slate-200 pt-6">

          <div className="mb-5 flex items-center gap-2">
            <Clock3 className="h-5 w-5 text-amber-600" />
            <h3 className="text-lg font-bold text-slate-900">
              Work Details
            </h3>
          </div>

          <div className="grid gap-5 md:grid-cols-2">

            <InfoCard
              icon={
                <Clock3 className="h-5 w-5 text-amber-600" />
              }
              label="Estimated Hours"
              value={task.estimated_hours?.toString() ?? "-"}
              color="amber"
            />

            <InfoCard
              icon={
                <Clock3 className="h-5 w-5 text-orange-600" />
              }
              label="Actual Hours"
              value={task.actual_hours?.toString() ?? "-"}
              color="orange"
            />

          </div>

        </div>

                {/*  Timeline  */}

        <div className="border-t border-slate-200 pt-6">

          <div className="mb-5 flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-violet-600" />
            <h3 className="text-lg font-bold text-slate-900">
              Timeline
            </h3>
          </div>

          <div className="grid gap-5 md:grid-cols-2">

            <InfoCard
              icon={
                <CalendarDays className="h-5 w-5 text-violet-600" />
              }
              label="Due Date"
              value={task.due_date ?? "-"}
              color="violet"
            />

            <InfoCard
              icon={
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              }
              label="Completed At"
              value={completedAt}
              color="green"
            />

          </div>

        </div>

        {/*  description  */}

        <div className="border-t border-slate-200 pt-6">

          <div className="mb-5 flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-slate-700" />
            <h3 className="text-lg font-bold text-slate-900">
              Task Description
            </h3>
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-slate-50 shadow-sm">

            <div className="border-b border-slate-200 bg-white px-6 py-4">
              <h4 className="text-sm font-bold uppercase tracking-wide text-slate-600">
                Description
              </h4>
            </div>

            <div className="p-6">
              <p className="whitespace-pre-line text-[15px] leading-8 text-slate-700">
                {task.description || "No description available."}
              </p>
            </div>

          </div>

        </div>

      </div>
    </Modal>
  );
}

type InfoCardProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
  color:
    | "blue"
    | "emerald"
    | "amber"
    | "orange"
    | "violet"
    | "green"
    | "cyan"
    | "indigo";
};

function InfoCard({
  icon,
  label,
  value,
  color,
}: InfoCardProps) {
  const colors = {
    blue: {
      bg: "bg-blue-50",
      border: "border-blue-100",
    },
    emerald: {
      bg: "bg-emerald-50",
      border: "border-emerald-100",
    },
    amber: {
      bg: "bg-amber-50",
      border: "border-amber-100",
    },
    orange: {
      bg: "bg-orange-50",
      border: "border-orange-100",
    },
    violet: {
      bg: "bg-violet-50",
      border: "border-violet-100",
    },
    green: {
      bg: "bg-green-50",
      border: "border-green-100",
    },
    cyan: {
      bg: "bg-cyan-50",
      border: "border-cyan-100",
    },
    indigo: {
      bg: "bg-indigo-50",
      border: "border-indigo-100",
    },
  };

  return (
    <div
      className={`group rounded-2xl border ${colors[color].border} ${colors[color].bg}
      p-5 transition-all duration-300
      hover:-translate-y-1
      hover:shadow-lg`}
    >
      <div className="flex items-center gap-4">

        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm`}
        >
          {icon}
        </div>

        <div className="flex-1">

          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
            {label}
          </p>

          <p className="mt-2 break-words text-base font-semibold text-slate-900 lg:text-lg">
            {value || "Not Available"}
          </p>

        </div>

      </div>
    </div>
  );
}