"use client";

import { useMemo, useState } from "react";

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
import EmployeeTaskStatusModal from "./EmployeeTaskStatusModal";


interface EmployeeTaskTableProps {
  tasks: TaskWithProject[];
}

export default function EmployeeTaskTable({
  tasks,
}: EmployeeTaskTableProps) {
  const [search, setSearch] = useState("");

  const [selectedTask, setSelectedTask] =
    useState<TaskWithProject | null>(null);

  const [statusOpen, setStatusOpen] =
    useState(false);

  const filteredTasks = useMemo(() => {
    const keyword = search.toLowerCase();

    return tasks.filter((task) => {
      return (
        task.task_code.toLowerCase().includes(keyword) ||
        task.title.toLowerCase().includes(keyword) ||
        task.project?.project_name
          ?.toLowerCase()
          .includes(keyword)
      );
    });
  }, [tasks, search]);

  return (
    <>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <Input
            placeholder="Search task..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="max-w-sm"
          />
        </div>

        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Task</TableHeader>

              <TableHeader>Project</TableHeader>

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
              </TableRow>
            ) : (
              filteredTasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>
                    <div>
                      <p className="font-semibold">
                        {task.task_code}
                      </p>

                      <p className="text-xs text-slate-500">
                        {task.title}
                      </p>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div>
                      <p className="font-medium">
                        {task.project?.project_name}
                      </p>

                      <p className="text-xs text-slate-500">
                        {task.project?.project_code}
                      </p>
                    </div>
                  </TableCell>

                  <TableCell>
                    <TaskPriorityBadge
                      priority={task.priority}
                    />
                  </TableCell>

                  <TableCell>
                    <TaskStatusBadge
                      status={task.status}
                    />
                  </TableCell>

                  <TableCell>
                    {task.due_date ?? "-"}
                  </TableCell>

                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        onClick={() =>
                          setSelectedTask(task)
                        }
                      >
                        View
                      </Button>

                      <Button
                        onClick={() => {
                          setSelectedTask(task);
                          setStatusOpen(true);
                        }}
                      >
                        Update
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
            <TaskDetailsModal
        open={!!selectedTask && !statusOpen}
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
      />

      <EmployeeTaskStatusModal
        open={statusOpen}
        task={selectedTask}
        onClose={() => {
          setStatusOpen(false);
          setSelectedTask(null);
        }}
      />
    </>
  );
}