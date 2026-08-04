"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import { deleteTaskAction } from "../task.action";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";

import { TaskWithProject } from "../task.types";

import TaskPriorityBadge from "./TaskPriorityBadge";
import TaskStatusBadge from "./TaskStatusBadge";
import TaskDetailsModal from "./TaskDetailsModal";
import TaskForm from "./TaskForm";

interface TaskTableProps {
  tasks: TaskWithProject[];
  projects: {
    id: string;
    project_name: string;
    project_code: string;
  }[];
}
export default function TaskTable({ tasks, projects }: TaskTableProps) {
  const [search, setSearch] = useState("");

  const [dialog, setDialog] = useState<{
    mode: "create" | "view" | "edit" | null;
    task: TaskWithProject | null;
  }>({
    mode: null,
    task: null,
  });

  const filteredTasks = useMemo(() => {
    const keyword = search.toLowerCase();

    return tasks.filter((task) => {
      return (
        task.task_code.toLowerCase().includes(keyword) ||
        task.title.toLowerCase().includes(keyword) ||
        task.project?.project_name?.toLowerCase().includes(keyword) ||
        task.member?.profile?.full_name?.toLowerCase().includes(keyword)
      );
    });
  }, [tasks, search]);

  return (
    <>
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <Input
            placeholder="Search task title, code, project, or employee..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-80"
          />

          <Button
            onClick={() => setDialog({ mode: "create", task: null })}
            className="flex items-center justify-center gap-2"
          >
            New Task
          </Button>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center shadow-xs">
            <h3 className="text-base font-bold text-slate-900">No Tasks Found</h3>
            <p className="mt-1 text-xs text-slate-500">No tasks match your search query. Click New Task to assign work.</p>
          </div>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Task Code</TableHeader>
                <TableHeader>Title</TableHeader>
                <TableHeader>Project</TableHeader>
                <TableHeader>Employee</TableHeader>
                <TableHeader>Priority</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader>Due Date</TableHeader>
                <TableHeader className="text-right">Actions</TableHeader>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredTasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>
                    <span className="font-semibold">{task.task_code}</span>
                  </TableCell>

                  <TableCell>
                    <div>
                      <p className="font-medium">{task.title}</p>

                      <p className="text-xs text-slate-500">
                        {task.description || "No description"}
                      </p>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div>
                      <p className="font-medium">
                        {task.project?.project_name}
                      </p>

                      
                    </div>
                  </TableCell>

                  <TableCell>
                    <div>
                      <p className="font-medium">
                        {task.member?.profile?.full_name}
                      </p>

                      <p className="text-xs text-slate-500">
                        {task.member?.profile?.employee_id}
                      </p>
                    </div>
                  </TableCell>

                  <TableCell>
                    <TaskPriorityBadge priority={task.priority} />
                  </TableCell>

                  <TableCell>
                    <TaskStatusBadge status={task.status} />
                  </TableCell>

                  <TableCell>{task.due_date ?? "-"}</TableCell>

                  <TableCell>
                    <div className="flex justify-end">
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          onClick={() => setDialog({ mode: "view", task })}
                        >
                          View
                        </Button>

                        <Button
                          onClick={() => setDialog({ mode: "edit", task })}
                        >
                          Edit
                        </Button>

                        <Button
                          variant="danger"
                          onClick={() => {
                            toast.warning("Delete this task?", {
                              description: "This action cannot be undone.",
                              action: {
                                label: "Delete",
                                onClick: async () => {
                                  const result = await deleteTaskAction(
                                    task.id,
                                  );

                                  if (!result.success) {
                                    toast.error(result.error);
                                    return;
                                  }

                                  toast.success(result.message);
                                },
                              },
                              cancel: {
                                label: "Cancel",
                                onClick: () => {},
                              },
                            });
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <TaskDetailsModal
        open={dialog.mode === "view"}
        task={dialog.task}
        onClose={() => setDialog({ mode: null, task: null })}
      />
      <TaskForm
        open={dialog.mode === "create" || dialog.mode === "edit"}
        task={dialog.mode === "edit" ? dialog.task : null}
        projects={projects}
        onClose={() => setDialog({ mode: null, task: null })}
      />
    </>
  );
}
