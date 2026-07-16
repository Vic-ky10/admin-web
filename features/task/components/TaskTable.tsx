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
  const [open, setOpen] = useState(false);

  const [selectedTask, setSelectedTask] = useState<TaskWithProject | null>(
    null,
  );

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
        <div className="flex items-center justify-between gap-4">
          <Input
            placeholder="Search task..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />

          <Button
            onClick={() => {
              setSelectedTask(null);
              setOpen(true);
            }}
          >
            New Task
          </Button>
        </div>

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

              <TableHeader>Actions</TableHeader>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredTasks.length === 0 ? (
              <TableRow>
                <TableCell>No tasks found.</TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
              </TableRow>
            ) : (
              filteredTasks.map((task) => (
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

                      <p className="text-xs text-slate-500">
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
                          onClick={() => {
                            setSelectedTask(task);
                          }}
                        >
                          View
                        </Button>

                        <Button
                          onClick={() => {
                            setSelectedTask(task);
                            setOpen(true);
                          }}
                        >
                          Edit
                        </Button>

                        <Button
                          variant="danger"
                          onClick={async () => {
                            if (!confirm("Delete this task?")) {
                              return;
                            }

                            const result = await deleteTaskAction(task.id);

                            if (!result.success) {
                              toast.error(result.error);
                              return;
                            }

                            toast.success(result.message);
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <TaskDetailsModal
        open={!!selectedTask}
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
      />
      <TaskForm
        open={open}
        task={selectedTask}
        projects={projects}
        onClose={() => {
          setOpen(false);
          setSelectedTask(null);
        }}
      />
    </>
  );
}
