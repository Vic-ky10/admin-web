"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Kanban, List, Plus } from "lucide-react";

import { deleteTaskAction, updateTaskStatusAction } from "../task.action";

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
import KanbanBoard from "./KanbanBoard";

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
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");

  // Detailed Filter states
  const [projectFilter, setProjectFilter] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [dialog, setDialog] = useState<{
    mode: "create" | "view" | "edit" | null;
    task: TaskWithProject | null;
  }>({
    mode: null,
    task: null,
  });

  // Extract unique employees assigned to tasks
  const uniqueEmployees = useMemo(() => {
    const map = new Map();
    tasks.forEach((t) => {
      const p = t.member?.profile;
      if (p && t.member?.profile_id) {
        map.set(t.member.profile_id, p.full_name);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    const keyword = search.toLowerCase();

    return tasks.filter((task) => {
      // Keyword search
      const matchesKeyword =
        !keyword ||
        task.task_code.toLowerCase().includes(keyword) ||
        task.title.toLowerCase().includes(keyword) ||
        task.project?.project_name?.toLowerCase().includes(keyword) ||
        task.member?.profile?.full_name?.toLowerCase().includes(keyword);

      // Category filters
      const matchesProject = !projectFilter || task.project_id === projectFilter;
      const matchesEmployee = !employeeFilter || task.member?.profile_id === employeeFilter;
      const matchesPriority = !priorityFilter || task.priority === priorityFilter;
      const matchesStatus = !statusFilter || task.status === statusFilter;

      return matchesKeyword && matchesProject && matchesEmployee && matchesPriority && matchesStatus;
    });
  }, [tasks, search, projectFilter, employeeFilter, priorityFilter, statusFilter]);

  return (
    <>
      <div className="space-y-5">
        {/* Toggle & Search Filters Area */}
        <div className="flex flex-col gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="w-full sm:w-80">
              <Input
                placeholder="Search task title, code, project, or employee..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full"
              />
            </div>

            {/* View Mode Toggle & Add Button */}
            <div className="flex items-center gap-3">
              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setViewMode("kanban")}
                  className={`p-2 rounded-lg flex items-center gap-1.5 text-xs font-bold transition cursor-pointer ${
                    viewMode === "kanban"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <Kanban className="h-4 w-4" />
                  Kanban
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  className={`p-2 rounded-lg flex items-center gap-1.5 text-xs font-bold transition cursor-pointer ${
                    viewMode === "table"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <List className="h-4 w-4" />
                  Table
                </button>
              </div>

              <Button
                onClick={() => setDialog({ mode: "create", task: null })}
                className="flex items-center justify-center gap-2"
              >
                <Plus className="h-4 w-4" />
                New Task
              </Button>
            </div>
          </div>

          {/* Advanced dropdown filters */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                Filter by Project
              </label>
              <select
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-blue-100"
              >
                <option value="">All Projects</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.project_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                Filter by Employee
              </label>
              <select
                value={employeeFilter}
                onChange={(e) => setEmployeeFilter(e.target.value)}
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-blue-100"
              >
                <option value="">All Employees</option>
                {uniqueEmployees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                Filter by Priority
              </label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-blue-100"
              >
                <option value="">All Priorities</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                Filter by Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-blue-100"
              >
                <option value="">All Statuses</option>
                <option value="Todo">Todo</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>
        </div>

        {/* View Mode Switching */}
        {viewMode === "kanban" ? (
          <KanbanBoard
            tasks={filteredTasks}
            projects={projects}
            isAdmin={true}
            onStatusChange={updateTaskStatusAction}
          />
        ) : filteredTasks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center shadow-xs animate-fade-in">
            <h3 className="text-base font-bold text-slate-900">No Tasks Found</h3>
            <p className="mt-1 text-xs text-slate-500">
              No tasks match your search query. Click New Task to assign work.
            </p>
          </div>
        ) : (
          <Table className="animate-fade-in">
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
                      <p className="font-medium text-slate-900">{task.title}</p>
                      <p className="text-xs text-slate-500">
                        {task.description || "No description"}
                      </p>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div>
                      <p className="font-medium text-slate-900">
                        {task.project?.project_name}
                      </p>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div>
                      <p className="font-medium text-slate-900">
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

                  <TableCell className="text-slate-600">
                    {task.due_date
                      ? new Date(task.due_date).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "-"}
                  </TableCell>

                  <TableCell>
                    <div className="flex justify-end">
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setDialog({ mode: "view", task })}
                        >
                          View
                        </Button>

                        <Button
                          size="sm"
                          onClick={() => setDialog({ mode: "edit", task })}
                        >
                          Edit
                        </Button>

                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => {
                            toast.warning("Delete this task?", {
                              description: "This action cannot be undone.",
                              action: {
                                label: "Delete",
                                onClick: async () => {
                                  const result = await deleteTaskAction(task.id);

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
      {dialog.mode && (dialog.mode === "create" || dialog.mode === "edit") && (
        <TaskForm
          open={dialog.mode === "create" || dialog.mode === "edit"}
          task={dialog.mode === "edit" ? dialog.task : null}
          projects={projects}
          onClose={() => setDialog({ mode: null, task: null })}
        />
      )}
    </>
  );
}



