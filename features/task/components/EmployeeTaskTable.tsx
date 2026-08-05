"use client";

import { useMemo, useState } from "react";
import { Kanban, List, CheckSquare } from "lucide-react";
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

import { TaskWithProject } from "../task.types";
import TaskPriorityBadge from "./TaskPriorityBadge";
import TaskStatusBadge from "./TaskStatusBadge";
import TaskDetailsModal from "./TaskDetailsModal";
import EmployeeTaskStatusModal from "./EmployeeTaskStatusModal";
import KanbanBoard from "./KanbanBoard";
import { updateTaskStatusAction } from "../task.action";

interface EmployeeTaskTableProps {
  tasks: TaskWithProject[];
  profileId?: string | null;
}

export default function EmployeeTaskTable({ tasks, profileId }: EmployeeTaskTableProps) {
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");

  // Filter states
  const [projectFilter, setProjectFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [selectedTask, setSelectedTask] = useState<TaskWithProject | null>(null);
  const [statusOpen, setStatusOpen] = useState(false);

  // Extract unique projects for dropdown filter
  const uniqueProjects = useMemo(() => {
    const map = new Map();
    tasks.forEach((t) => {
      if (t.project) {
        map.set(t.project_id, t.project.project_name);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    const keyword = search.toLowerCase();

    return tasks.filter((task) => {
      const matchesKeyword =
        task.task_code.toLowerCase().includes(keyword) ||
        task.title.toLowerCase().includes(keyword) ||
        task.project?.project_name?.toLowerCase().includes(keyword);

      const matchesProject = !projectFilter || task.project_id === projectFilter;
      const matchesPriority = !priorityFilter || task.priority === priorityFilter;
      const matchesStatus = !statusFilter || task.status === statusFilter;

      return matchesKeyword && matchesProject && matchesPriority && matchesStatus;
    });
  }, [tasks, search, projectFilter, priorityFilter, statusFilter]);

  return (
    <div className="space-y-5">
      {/* Search and Filters */}
      <div className="flex flex-col gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="w-full sm:w-80">
            <Input
              placeholder="Search task by title, code, or project..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full"
            />
          </div>

          {/* View Toggler */}
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
        </div>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
              {uniqueProjects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
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
              disabled={viewMode === "kanban"}
            >
              <option value="">All Statuses</option>
              <option value="Todo">Todo</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Board/Table Layout */}
      {viewMode === "kanban" ? (
        <KanbanBoard
          tasks={filteredTasks}
          projects={[]}
          isAdmin={false}
          profileId={profileId}
          onStatusChange={updateTaskStatusAction}
        />
      ) : filteredTasks.length === 0 ? (
        <EmptyState
          title="No tasks found"
          description="You have no assigned tasks matching your search query."
          icon={<CheckSquare className="h-6 w-6 text-emerald-600" />}
        />
      ) : (
        <Table className="animate-fade-in">
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

