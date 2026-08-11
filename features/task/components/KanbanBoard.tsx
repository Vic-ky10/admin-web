"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Calendar,
  Clock,
  MessageSquare,
  Paperclip,
  CheckSquare,
  Plus,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { TaskWithProject, TASK_STATUS, TASK_PRIORITY } from "../task.types";
import TaskDetailsModal from "./TaskDetailsModal";
import TaskForm from "./TaskForm";
import Button from "@/components/ui/Button";
import { deleteTaskAction } from "../task.action";

interface KanbanBoardProps {
  tasks: TaskWithProject[];
  projects: {
    id: string;
    project_name: string;
    project_code: string;
  }[];
  isAdmin: boolean;
  profileId?: string | null;
  onStatusChange: (
    taskId: string,
    newStatus: string,
    actualHours?: number,
  ) => Promise<{ success: boolean; message?: string; error?: string }>;
}

export default function KanbanBoard({
  tasks,
  projects,
  isAdmin,
  profileId,
  onStatusChange,
}: KanbanBoardProps) {
  const router = useRouter();
  const [draggedOverColumn, setDraggedOverColumn] = useState<string | null>(
    null,
  );
  const [selectedTask, setSelectedTask] = useState<TaskWithProject | null>(
    null,
  );
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editTask, setEditTask] = useState<TaskWithProject | null>(null);

  // Quick Filters
  const [quickFilter, setQuickFilter] = useState<
    "All" | "Mine" | "High" | "Overdue" | "Completed"
  >("All");

  // Task Completion Modal state
  const [completionConfirm, setCompletionConfirm] = useState<{
    task: TaskWithProject;
    targetStatus: string;
  } | null>(null);
  const [actualHoursInput, setActualHoursInput] = useState<number>(0);

  // Task Deletion Modal state
  const [deleteConfirm, setDeleteConfirm] = useState<TaskWithProject | null>(
    null,
  );

  // Group columns
  const columns = [
    {
      id: TASK_STATUS.TODO,
      title: "Todo",
      color: "bg-slate-50/60 border-slate-200",
    },
    {
      id: TASK_STATUS.IN_PROGRESS,
      title: "In Progress",
      color: "bg-blue-50/80 border-blue-200",
    },
    {
      id: TASK_STATUS.COMPLETED,
      title: "Completed",
      color: "bg-emerald-50/80 border-emerald-200",
    },
  ];

  // Check if a task is overdue
  const isTaskOverdue = (task: TaskWithProject) => {
    if (task.status === TASK_STATUS.COMPLETED || !task.due_date) return false;
    return new Date(task.due_date) < new Date();
  };

  // Filtered Tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // 1. Quick Filters
      if (quickFilter === "Mine") {
        if (!profileId || task.member?.profile_id !== profileId) return false;
      } else if (quickFilter === "High") {
        if (
          task.priority !== TASK_PRIORITY.HIGH &&
          task.priority !== TASK_PRIORITY.URGENT
        )
          return false;
      } else if (quickFilter === "Overdue") {
        if (!isTaskOverdue(task)) return false;
      } else if (quickFilter === "Completed") {
        if (task.status !== TASK_STATUS.COMPLETED) return false;
      }

      return true;
    });
  }, [tasks, quickFilter, profileId]);

  const handleDragStart = (e: React.DragEvent, task: TaskWithProject) => {
    if (!isAdmin) {
      if (
        task.project?.status === "Completed" ||
        task.project?.status === "Cancelled"
      ) {
        e.preventDefault();
        toast.error(
          "This project is completed/cancelled. Tasks are read-only.",
        );
        return;
      }
      if (!profileId || task.member?.profile_id !== profileId) {
        e.preventDefault();
        toast.error("You can only drag tasks assigned to you.");
        return;
      }
    }
    e.dataTransfer.setData("text/plain", task.id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    setDraggedOverColumn(status);
  };

  const handleDragLeave = () => {
    setDraggedOverColumn(null);
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    setDraggedOverColumn(null);
    const taskId = e.dataTransfer.getData("text/plain");
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    if (task.status === targetStatus) return;

    // Employee drag validation rules
    if (!isAdmin) {
      // Check if project is completed/cancelled
      if (
        task.project?.status === "Completed" ||
        task.project?.status === "Cancelled"
      ) {
        toast.error(
          "This project is completed/cancelled. Tasks are read-only.",
        );
        return;
      }
      // Check ownership
      if (!profileId || task.member?.profile_id !== profileId) {
        toast.error("You can only drag tasks assigned to you.");
        return;
      }

      // Check transitions: Todo -> In Progress -> Completed
      if (
        task.status === TASK_STATUS.TODO &&
        targetStatus === TASK_STATUS.COMPLETED
      ) {
        toast.warning("Please move tasks to 'In Progress' first.");
        return;
      }
      if (
        task.status === TASK_STATUS.IN_PROGRESS &&
        targetStatus === TASK_STATUS.TODO
      ) {
        toast.error("Moving tasks back to 'Todo' is not allowed.");
        return;
      }
      if (task.status === TASK_STATUS.COMPLETED) {
        toast.error("Completed tasks cannot be reopened.");
        return;
      }
    }

    if (targetStatus === TASK_STATUS.COMPLETED) {
      setActualHoursInput(task.actual_hours || task.estimated_hours || 0);
      setCompletionConfirm({ task, targetStatus });
    } else {
      await executeStatusChange(task.id, targetStatus);
    }
  };

  const executeStatusChange = async (
    taskId: string,
    status: string,
    hours?: number,
  ) => {
    const response = await onStatusChange(taskId, status, hours);
    if (response.success) {
      toast.success(response.message || `Task moved to ${status}`);
    } else {
      toast.error(response.error || "Failed to update task status");
    }
  };

  const handleConfirmCompletion = async () => {
    if (!completionConfirm) return;
    const { task, targetStatus } = completionConfirm;
    setCompletionConfirm(null);
    await executeStatusChange(task.id, targetStatus, actualHoursInput);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;
    const taskToDelete = deleteConfirm;
    setDeleteConfirm(null);
    try {
      const response = await deleteTaskAction(taskToDelete.id);
      if (response.success) {
        toast.success(response.message || "Task deleted successfully.");
        router.refresh();
      } else {
        toast.error(response.error || "Failed to delete task.");
      }
    } catch (err: unknown) {
      const errMsg =
        err instanceof Error ? err.message : "An unexpected error occurred.";
      toast.error(errMsg);
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case TASK_PRIORITY.URGENT:
        return "bg-rose-50 text-rose-700 ring-rose-600/10";
      case TASK_PRIORITY.HIGH:
        return "bg-orange-50 text-orange-700 ring-orange-600/10";
      case TASK_PRIORITY.MEDIUM:
        return "bg-amber-50 text-amber-700 ring-amber-600/10";
      default:
        return "bg-slate-50 text-slate-700 ring-slate-600/10";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case TASK_PRIORITY.URGENT:
        return "🔴";
      case TASK_PRIORITY.HIGH:
        return "🟠";
      case TASK_PRIORITY.MEDIUM:
        return "🟡";
      default:
        return "🟢";
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-wrap gap-2">
          {(["All", "Mine", "High", "Overdue", "Completed"] as const).map(
            (filter) => {
              const isActive = quickFilter === filter;
              return (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setQuickFilter(filter)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 hover:scale-[1.02] cursor-pointer ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60"
                  }`}
                >
                  {filter === "Mine"
                    ? "My Tasks"
                    : filter === "High"
                      ? "High Priority"
                      : filter}
                </button>
              );
            },
          )}
        </div>

        {isAdmin && (
          <Button
            size="sm"
            onClick={() => {
              setIsCreateOpen(true);
            }}
            className="flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            Add Task
          </Button>
        )}
      </div>

      {/* Columns Grid */}
      <div className="grid gap-6 md:grid-cols-3 items-start">
        {columns.map((col) => {
          const colTasks = filteredTasks.filter((t) => t.status === col.id);
          const isOver = draggedOverColumn === col.id;

          return (
            <div
              key={col.id}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.id)}
              className={`rounded-2xl border p-4 min-h-[500px] flex flex-col transition-all duration-300 ${col.color} ${
                isOver
                  ? "border-blue-500 bg-blue-50/40 shadow-[0_0_20px_rgba(59,130,246,0.12)] scale-[1.01]"
                  : ""
              }`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-800 text-sm">
                    {col.title}
                  </h3>
                  <span className="bg-slate-200/80 text-slate-600 text-[11px] font-bold px-2 py-0.5 rounded-full">
                    {colTasks.length}
                  </span>
                </div>
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreateOpen(true);
                    }}
                    className="p-1 rounded-md text-slate-400 hover:bg-slate-200/50 hover:text-slate-600 transition"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Column Cards Container */}
              <div className="flex-1 space-y-3 max-h-[550px] overflow-y-auto pr-1 pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {colTasks.length === 0 ? (
                  <div className="h-48 rounded-xl border border-dashed border-slate-200 bg-white flex flex-col items-center justify-center p-4 text-center">
                    <span className="text-2xl mb-2">🎉</span>
                    <p className="text-xs font-semibold text-slate-700">
                      No tasks in this stage
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1 max-w-[150px]">
                      Drag tasks here or create a new task
                    </p>
                  </div>
                ) : (
                  colTasks.map((task) => {
                    const isOverdue = isTaskOverdue(task);

                    return (
                      <div
                        key={task.id}
                        draggable="true"
                        onDragStart={(e) => handleDragStart(e, task)}
                        onClick={() => {
                          setSelectedTask(task);
                          setIsDetailsOpen(true);
                        }}
                        className={`group bg-white rounded-xl border border-slate-200/70 p-4 shadow-sm hover:border-blue-400 hover:-translate-y-0.5 hover:shadow-md hover:scale-[1.01] transition-all duration-200 select-none cursor-grab active:cursor-grabbing relative overflow-hidden`}
                      >
                        {/* Overdue Glow/Border Indicator */}
                        {isOverdue && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500" />
                        )}

                        <div className="space-y-3">
                          {/* Card Header Info */}
                          <div className="flex items-center justify-between text-[11px]">
                            <h3 className="font-bold text-slate-900 text-xs leading-relaxed line-clamp-2 group-hover:text-blue-600 transition-colors">
                              {" "}
                              {task.project?.project_name}
                            </h3>

                            {/* {task.task_code} */}
                            {/* </span> */}
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ring-inset ${getPriorityBadgeColor(
                                task.priority,
                              )}`}
                            >
                              <span>{getPriorityIcon(task.priority)}</span>
                              {task.priority}
                            </span>
                          </div>

                          {/* Task Title */}
                          <h4 className=" text-slate-900 text-xs leading-relaxed line-clamp-2 transition-colors">
                            {task.title}
                          </h4>

                          <div className="space-y-1">
                            <div className="flex justify-between items-center text-[10px] font-semibold text-slate-400">
                              <span>Progress</span>
                              <span>
                                {task.status === TASK_STATUS.COMPLETED
                                  ? "100%"
                                  : task.status === TASK_STATUS.IN_PROGRESS
                                    ? "50%"
                                    : "0%"}
                              </span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  task.status === TASK_STATUS.COMPLETED
                                    ? "bg-emerald-500"
                                    : task.status === TASK_STATUS.IN_PROGRESS
                                      ? "bg-blue-500"
                                      : "bg-slate-300"
                                }`}
                                style={{
                                  width:
                                    task.status === TASK_STATUS.COMPLETED
                                      ? "100%"
                                      : task.status === TASK_STATUS.IN_PROGRESS
                                        ? "50%"
                                        : "0%",
                                }}
                              />
                            </div>
                          </div>

                          {completionConfirm?.task.id === task.id && (
                            <div
                              className="mt-3 p-3 bg-slate-50 rounded-xl border border-emerald-100 space-y-3 animate-fade-in shadow-sm"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="flex items-start gap-2">
                                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-emerald-100 text-emerald-600">
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                </div>
                                <div>
                                  <h3 className="font-bold text-slate-900 text-xs">
                                    Complete Task?
                                  </h3>
                                  <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                                    Log actual hours worked
                                  </p>
                                </div>
                              </div>
                              <div className="pt-1">
                                <input
                                  type="number"
                                  min="0"
                                  step="0.5"
                                  value={actualHoursInput}
                                  onChange={(e) =>
                                    setActualHoursInput(
                                      parseFloat(e.target.value) || 0,
                                    )
                                  }
                                  className="w-full bg-white border border-slate-200 rounded-md p-1.5 text-xs font-semibold focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </div>
                              <div className="flex justify-end gap-2 pt-1">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setCompletionConfirm(null);
                                  }}
                                  className="px-2 py-1 text-[10px] font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleConfirmCompletion();
                                  }}
                                  className="px-2 py-1 text-[10px] font-bold text-white bg-emerald-600 border border-emerald-600 rounded-md hover:bg-emerald-700 flex items-center gap-1 transition-colors"
                                >
                                  <CheckCircle2 className="h-3 w-3" />
                                  Confirm
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Divider */}
                          <div className="border-t border-slate-100 " />

                          {/* Card Footer Widgets */}
                          {/* <div className="flex items-center justify-between text-[11px] text-slate-400">
                       
                            <div className="flex items-center gap-1">
                              <Calendar
                                className={`h-3.5 w-3.5 ${isOverdue ? "text-rose-500 font-black" : "text-slate-400"}`}
                              />
                              <span
                                className={
                                  isOverdue ? "text-rose-600 font-bold" : ""
                                }
                              >
                                {task.due_date
                                  ? new Date(task.due_date).toLocaleDateString(
                                      "en-IN",
                                      {
                                        day: "2-digit",
                                        month: "short",
                                      },
                                    )
                                  : "No due date"}
                              </span>
                              <div className="flex justify-start">
                                <div className="flex items-end gap-1 text-[11px] font-semibold text-slate-600 bg-slate-50 rounded-lg w-fit border border-slate-100">
                                  <span>👤</span>
                                  <span>
                                    {task.member?.profile?.full_name ||
                                      "Unassigned"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>  */}

                       {/* Card Footer Widgets */} 
                          <div className="flex items-center justify-between w-full">
                            {/* Assignee - Left Side */}
                            <div className="flex flex-row items-center gap-[3px] px-2 py-[3px] rounded-md border border-slate-200  self-start max-w-full text-[11px] font-semibold text-slate-600 bg-slate-50">
                              <span>👤</span>
                              <span>
                                {task.member?.profile?.full_name ||
                                  "Unassigned"}
                              </span>
                            </div>

                            {/* Date - Right Side */}
                            <div className="text-[11px] font-medium text-slate-500 ">
                              {task.due_date
                                ? new Date(task.due_date).toLocaleDateString(
                                    "en-IN",
                                    {
                                      day: "2-digit",
                                      month: "short",
                                    },
                                  )
                                : "No due date"}
                            </div>
                          </div>

                          {/*                      
                          <div className="flex items-center gap-3 text-[10px] text-slate-350 font-semibold pt-1">
                            <span className="flex items-center gap-0.5">
                              <CheckSquare className="h-3 w-3 text-slate-300" />
                              {task.status === TASK_STATUS.COMPLETED ? "1/1" : "0/1"}
                            </span>
                            <span className="flex items-center gap-0.5">
                              <MessageSquare className="h-3 w-3 text-slate-300" />
                              0
                            </span>
                            <span className="flex items-center gap-0.5">
                              <Paperclip className="h-3 w-3 text-slate-300" />
                              0
                            </span>
                            {task.estimated_hours && (
                              <span className="flex items-center gap-0.5 text-slate-400 ml-auto font-bold bg-slate-100 px-1.5 py-0.5 rounded-sm">
                                <Clock className="h-3 w-3" />
                                {task.status === TASK_STATUS.COMPLETED
                                  ? `${task.actual_hours || task.estimated_hours}h`
                                  : `${task.estimated_hours}h`}
                              </span>
                            )}
                          </div> */}

                          {/* Delete button moved to TaskDetailsModal */}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Details Modal */}
      {isDetailsOpen && (
        <TaskDetailsModal
          open={isDetailsOpen}
          task={selectedTask}
          isAdmin={isAdmin}
          onEdit={(task) => {
            setEditTask(task);
            setIsDetailsOpen(false);
          }}
          onDelete={(task) => {
            setDeleteConfirm(task);
            setIsDetailsOpen(false);
          }}
          onClose={() => {
            setSelectedTask(null);
            setIsDetailsOpen(false);
          }}
        />
      )}

      {/* Task Create/Edit form */}
      {(isCreateOpen || editTask) && (
        <TaskForm
          open={isCreateOpen || !!editTask}
          task={editTask}
          projects={projects}
          onClose={() => {
            setIsCreateOpen(false);
            setEditTask(null);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center  backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 shadow-xl w-full max-w-sm animate-fade-in border border-slate-100">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Delete Task?
                </h3>
                <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold text-slate-700">
                    {deleteConfirm.task_code}
                  </span>
                  ? This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
