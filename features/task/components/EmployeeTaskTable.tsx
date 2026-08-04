"use client";

import { useMemo, useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import EmptyState from "@/components/ui/EmptyState";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { CheckSquare } from "lucide-react";

import { TaskWithProject } from "../task.types";
import TaskPriorityBadge from "./TaskPriorityBadge";
import TaskStatusBadge from "./TaskStatusBadge";
import TaskDetailsModal from "./TaskDetailsModal";
import EmployeeTaskStatusModal from "./EmployeeTaskStatusModal";

interface EmployeeTaskTableProps {
  tasks: TaskWithProject[];
}

export default function EmployeeTaskTable({ tasks }: EmployeeTaskTableProps) {
  const [search, setSearch] = useState("");
  const [selectedTask, setSelectedTask] = useState<TaskWithProject | null>(null);
  const [statusOpen, setStatusOpen] = useState(false);

  const filteredTasks = useMemo(() => {
    const keyword = search.toLowerCase();

    return tasks.filter((task) => {
      return (
        task.task_code.toLowerCase().includes(keyword) ||
        task.title.toLowerCase().includes(keyword) ||
        task.project?.project_name?.toLowerCase().includes(keyword)
      );
    });
  }, [tasks, search]);

  return (
    <div className="space-y-5">
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <Input
          placeholder="Search task by title, code, or project..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-80"
        />
      </div>

      {filteredTasks.length === 0 ? (
        <EmptyState
          title="No tasks found"
          description="You have no assigned tasks matching your search query."
          icon={<CheckSquare className="h-6 w-6 text-emerald-600" />}
        />
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Task</TableHeader>
              <TableHeader>Project</TableHeader>
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
                  <div>
                    <p className="font-bold text-slate-900">{task.title}</p>
                    <p className="text-xs text-slate-500 font-mono">{task.task_code}</p>
                  </div>
                </TableCell>

                <TableCell>{task.project?.project_name ?? "-"}</TableCell>

                <TableCell>
                  <TaskPriorityBadge priority={task.priority} />
                </TableCell>

                <TableCell>
                  <TaskStatusBadge status={task.status} />
                </TableCell>

                <TableCell className="text-slate-600">
                  {task.due_date
                    ? new Date(task.due_date).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "-"}
                </TableCell>

                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedTask(task)}
                    >
                      View
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setSelectedTask(task);
                        setStatusOpen(true);
                      }}
                    >
                      Update Status
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {selectedTask && !statusOpen && (
        <TaskDetailsModal
          open={!!selectedTask}
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}

      {selectedTask && statusOpen && (
        <EmployeeTaskStatusModal
          open={statusOpen}
          task={selectedTask}
          onClose={() => {
            setStatusOpen(false);
            setSelectedTask(null);
          }}
        />
      )}
    </div>
  );
}