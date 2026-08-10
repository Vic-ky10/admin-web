"use client";

import { useQuery } from "@tanstack/react-query";
import { 
  CalendarDays, 
  UsersRound, 
  FolderKanban, 
  ArrowLeft, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  Flame, 
  Sparkles 
} from "lucide-react";
import { useMemo, useState } from "react";

import Modal from "@/components/ui/Modal";
import PageHeader from "@/components/layout/PageHeader";
import EmptyState from "@/components/ui/EmptyState";

import {
  PROJECT_STATUS,
  EmployeeProject,
  ProjectStatus,
} from "../project.types";
import {
  formatProjectDate,
} from "../project.utils";
import ProjectMemberList from "./ProjectMemberList";
import ProjectSearch from "./ProjectSearch";
import { ProjectStatusBadge } from "./ProjectStatusBadge";

import KanbanBoard from "@/features/task/components/KanbanBoard";
import { updateTaskStatusAction } from "@/features/task/task.action";
import { TaskWithProject } from "@/features/task/task.types";

interface EmployeeProjectClientProps {
  projects: EmployeeProject[];
  tasks: TaskWithProject[];
  profileId: string;
}

export default function EmployeeProjectClient({
  projects,
  tasks,
  profileId,
}: EmployeeProjectClientProps) {
  const [search, setSearch] = useState("");
  
  // View switcher states
  const [viewMode, setViewMode] = useState<"list" | "detail">("list");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [visibilityFilter, setVisibilityFilter] = useState<"active" | "completed" | "all">("active");
  
  // Tabs switcher
  const [activeTab, setActiveTab] = useState<"dashboard" | "kanban" | "tasks" | "members">("dashboard");

  const [selectedProjectMembers, setSelectedProjectMembers] =
    useState<EmployeeProject | null>(null);

  const { data: queryProjects } = useQuery({
    queryKey: ["employee-projects", projects.length],
    queryFn: async () => projects,
    initialData: projects,
  });

  const filteredProjects = useMemo(() => {
    const keyword = search.toLowerCase();

    return queryProjects.filter((membership) => {
      const project = membership.project;
      if (!project) return false;

      const matchesSearch =
        project.project_name.toLowerCase().includes(keyword) ||
        project.project_code.toLowerCase().includes(keyword) ||
        (project.description && project.description.toLowerCase().includes(keyword));

      // Handle visibility filter tabs
      let matchesVisibility = true;
      if (visibilityFilter === "active") {
        matchesVisibility = project.status !== "Completed" && project.status !== "Archived" && project.status !== "Cancelled";
      } else if (visibilityFilter === "completed") {
        matchesVisibility = project.status === "Completed";
      } else if (visibilityFilter === "all") {
        matchesVisibility = project.status !== "Archived";
      }

      return matchesSearch && matchesVisibility;
    });
  }, [queryProjects, search, visibilityFilter]);

  // Selected project details lookup
  const selectedMembership = useMemo(() => {
    if (!selectedProjectId) return null;
    return queryProjects.find((m) => m.project_id === selectedProjectId) || null;
  }, [queryProjects, selectedProjectId]);

  const selectedProject = selectedMembership?.project || null;

  // Tasks for the selected project
  const projectTasks = useMemo(() => {
    if (!selectedProjectId) return [];
    return tasks.filter((t) => t.project_id === selectedProjectId);
  }, [tasks, selectedProjectId]);

  // Employee workload stats inside the selected project
  const employeeWorkloadStats = useMemo(() => {
    const employeeProjectTasks = projectTasks.filter(
      (t) => t.member?.profile_id === profileId
    );

    const completed = employeeProjectTasks.filter((t) => t.status === "Completed").length;
    const inProgress = employeeProjectTasks.filter((t) => t.status === "In Progress").length;
    const todo = employeeProjectTasks.filter((t) => t.status === "Todo").length;
    
    const overdue = employeeProjectTasks.filter((t) => {
      if (t.status === "Completed" || !t.due_date) return false;
      return new Date(t.due_date) < new Date();
    }).length;

    return {
      assigned: employeeProjectTasks.length,
      completed,
      inProgress,
      todo,
      overdue,
    };
  }, [projectTasks, profileId]);

  // General project statistics
  const projectStats = useMemo(() => {
    if (projectTasks.length === 0) {
      return {
        completed: 0,
        open: 0,
        overdue: 0,
        highPriority: 0,
        percent: 0,
        health: "Healthy" as "Healthy" | "At Risk" | "Delayed",
        healthColor: "text-emerald-600 bg-emerald-50 border-emerald-150",
        healthBullet: "🟢"
      };
    }

    const completed = projectTasks.filter((t) => t.status === "Completed").length;
    const open = projectTasks.filter((t) => t.status !== "Completed").length;
    const highPriority = projectTasks.filter(
      (t) => t.priority === "High" || t.priority === "Urgent"
    ).length;

    const overdue = projectTasks.filter((t) => {
      if (t.status === "Completed" || !t.due_date) return false;
      return new Date(t.due_date) < new Date();
    }).length;

    const percent = Math.round((completed / projectTasks.length) * 100);

    let health: "Healthy" | "At Risk" | "Delayed" = "Healthy";
    let healthColor = "text-emerald-600 bg-emerald-50 border-emerald-150";
    let healthBullet = "🟢";

    if (overdue >= 3) {
      health = "Delayed";
      healthColor = "text-rose-600 bg-rose-50 border-rose-150";
      healthBullet = "🔴";
    } else if (overdue > 0) {
      health = "At Risk";
      healthColor = "text-amber-600 bg-amber-50 border-amber-150";
      healthBullet = "🟡";
    }

    return { completed, open, overdue, highPriority, percent, health, healthColor, healthBullet };
  }, [projectTasks]);

  // Workload heatmap for dashboard overview (Heatmap)
  const workloadData = useMemo(() => {
    if (!selectedMembership) return [];
    
    return selectedMembership.team.map((member) => {
      const memberTasks = projectTasks.filter((t) => t.project_member_id === member.id);
      const activeTasksCount = memberTasks.filter((t) => t.status !== "Completed").length;
      const completedTasksCount = memberTasks.filter((t) => t.status === "Completed").length;

      return {
        memberId: member.id,
        name: member.employee?.full_name || "Unknown employee",
        role: member.member_role,
        designation: member.employee?.designation || "Staff",
        total: memberTasks.length,
        active: activeTasksCount,
        completed: completedTasksCount,
      };
    }).sort((a, b) => b.total - a.total);
  }, [selectedMembership, projectTasks]);

  // Activity feed timeline
  const activityTimeline = useMemo(() => {
    const feed: { id: string; date: Date; icon: string; text: string }[] = [];

    projectTasks.forEach((task) => {
      const assigneeName = task.member?.profile?.full_name || "Someone";

      feed.push({
        id: `${task.id}-created`,
        date: new Date(task.created_at),
        icon: "📌",
        text: `${assigneeName} was assigned task ${task.task_code}: ${task.title}`,
      });

      if (task.completed_at) {
        feed.push({
          id: `${task.id}-completed`,
          date: new Date(task.completed_at),
          icon: "✅",
          text: `${assigneeName} completed task ${task.task_code}: ${task.title}`,
        });
      }

      if (task.status === "In Progress" && task.updated_at !== task.created_at) {
        feed.push({
          id: `${task.id}-inprogress`,
          date: new Date(task.updated_at),
          icon: "⏳",
          text: `${assigneeName} moved task ${task.task_code} to In Progress`,
        });
      }
    });

    return feed
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 10);
  }, [projectTasks]);

  const activeCount = queryProjects.filter(
    (membership) => membership.project?.status === PROJECT_STATUS.ACTIVE
  ).length;
  const completedCount = queryProjects.filter(
    (membership) => membership.project?.status === PROJECT_STATUS.COMPLETED
  ).length;

  // Render Project Detail view
  if (viewMode === "detail" && selectedProject && selectedMembership) {
    const progressText = `${projectStats.completed} / ${projectTasks.length} Tasks`;

    const derivedDepartments = (() => {
      if (!selectedMembership.team) return "";
      const counts: { [key: string]: number } = {};
      selectedMembership.team.forEach((m) => {
        const dept = m.employee?.department || "Other";
        counts[dept] = (counts[dept] || 0) + 1;
      });
      return Object.entries(counts)
        .map(([dept, count]) => `${dept} (${count})`)
        .join(", ");
    })();

    return (
      <div className="space-y-6 max-w-[1920px] mx-auto animate-fade-in">
        {/* Back navigation header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setViewMode("list");
                setSelectedProjectId(null);
              }}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition shadow-xs cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-black text-slate-900">
                  {selectedProject.project_name}
                </h1>
                <span className="font-mono text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                  {selectedProject.project_code}
                </span>
                {derivedDepartments && (
                  <span className="text-xs text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100 font-semibold">
                    Departments: {derivedDepartments}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Role: <span className="font-bold text-slate-800 underline">{selectedMembership.member_role}</span> • Timeline: {formatProjectDate(selectedProject.start_date)} - {formatProjectDate(selectedProject.end_date)}
              </p>
            </div>
          </div>

          <div className="text-xs text-slate-500 font-semibold italic">
            Read-only workspace
          </div>
        </div>

        {/* 6 Workspace Stats Widgets */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          {/* Progress */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex flex-col justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Progress
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-black text-slate-900">{projectStats.percent}%</span>
              <span className="text-[10px] font-semibold text-slate-400">{progressText}</span>
            </div>
            <div className="mt-2.5 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-emerald-600 rounded-full transition-all duration-350"
                style={{ width: `${projectStats.percent}%` }}
              />
            </div>
          </div>

          {/* Health */}
          <div className={`rounded-2xl border p-5 shadow-xs flex flex-col justify-between ${projectStats.healthColor}`}>
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-85">
              Health Status
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-black">{projectStats.health}</span>
              <span className="text-xs">{projectStats.healthBullet}</span>
            </div>
            <span className="text-[10px] font-semibold mt-2.5 opacity-80">
              {projectStats.overdue} Overdue tasks remaining
            </span>
          </div>

          {/* Members */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex flex-col justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Team Members
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-black text-slate-900">{selectedMembership.team.length}</span>
              <UsersRound className="h-4 w-4 text-slate-400" />
            </div>
            <span className="text-[10px] font-semibold mt-2.5 text-slate-400">
              Total active workers
            </span>
          </div>

          {/* Open Tasks */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex flex-col justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Open Tasks
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-black text-slate-900">{projectStats.open}</span>
              <Clock className="h-4 w-4 text-slate-400" />
            </div>
            <span className="text-[10px] font-semibold mt-2.5 text-slate-400">
              Todo and In Progress items
            </span>
          </div>

          {/* Completed */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex flex-col justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Completed Tasks
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-black text-slate-900">{projectStats.completed}</span>
              <CheckCircle2 className="h-4 w-4 text-slate-400" />
            </div>
            <span className="text-[10px] font-semibold mt-2.5 text-slate-400">
              Finished project scopes
            </span>
          </div>

          {/* High Priority */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex flex-col justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              High Priority
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-black text-slate-900">{projectStats.highPriority}</span>
              <AlertCircle className="h-4 w-4 text-slate-400" />
            </div>
            <span className="text-[10px] font-semibold mt-2.5 text-slate-400">
              High / Urgent milestones
            </span>
          </div>
        </div>

        {/* 100% Celebration Banner */}
        {projectStats.percent === 100 && projectTasks.length > 0 && (
          <div className="bg-gradient-to-r from-emerald-500 to-teal-650 rounded-2xl p-6 text-white border border-emerald-600 shadow-md relative overflow-hidden animate-fade-in flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-lg font-black flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-300 animate-pulse" />
                🎉 Project Completed!
              </h2>
              <p className="text-xs text-emerald-50/90 leading-relaxed max-w-xl">
                All tasks have been finished. Completed on {new Date().toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}.
              </p>
            </div>
            <div className="shrink-0 flex items-center justify-center bg-white/10 px-4 py-2 rounded-xl border border-white/20 text-xs font-bold font-mono">
              🚀 100% DONE
            </div>
          </div>
        )}

        {/* Tabs switcher */}
        <div className="border-b border-slate-200">
          <nav className="flex gap-6">
            {(["dashboard", "kanban", "tasks", "members"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 text-sm font-bold border-b-2 transition duration-150 cursor-pointer capitalize ${
                  activeTab === tab
                    ? "border-emerald-600 text-emerald-600"
                    : "border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-350"
                }`}
              >
                {tab === "tasks" ? "Task List" : tab === "kanban" ? "My Kanban" : tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab contents */}
        <div className="space-y-6">
          {activeTab === "dashboard" && (
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Left 2 Columns: Heatmap, My Workload */}
              <div className="lg:col-span-2 space-y-6">
                {/* Employee workload card */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    My Workload Dashboard
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl text-center">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wide block">Assigned</span>
                      <span className="text-lg font-black text-slate-800 mt-1 block">{employeeWorkloadStats.assigned}</span>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl text-center">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wide block">Todo</span>
                      <span className="text-lg font-black text-slate-800 mt-1 block">{employeeWorkloadStats.todo}</span>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl text-center">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wide block">Progress</span>
                      <span className="text-lg font-black text-slate-800 mt-1 block">{employeeWorkloadStats.inProgress}</span>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl text-center">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wide block">Completed</span>
                      <span className="text-lg font-black text-emerald-600 mt-1 block">{employeeWorkloadStats.completed}</span>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl text-center col-span-2 sm:col-span-1">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wide block text-rose-500">Overdue</span>
                      <span className={`text-lg font-black mt-1 block ${employeeWorkloadStats.overdue > 0 ? "text-rose-600 animate-pulse" : "text-slate-800"}`}>
                        {employeeWorkloadStats.overdue}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Heatmap */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <Flame className="h-4 w-4 text-orange-500" />
                    Team Workload Distribution
                  </h3>
                  <div className="space-y-4">
                    {workloadData.map((row) => {
                      const totalTasks = projectTasks.length || 1;
                      return (
                        <div key={row.memberId} className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold text-slate-700">
                            <div>
                              <span className="font-bold text-slate-900">{row.name}</span>
                              <span className="text-[11px] text-slate-400 font-medium ml-2">
                                {row.designation}
                              </span>
                            </div>
                            <span className="font-mono text-xs">
                              {row.total} Tasks ({row.active} Active)
                            </span>
                          </div>
                          <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
                            <div
                              className="h-full bg-blue-500 transition-all duration-300"
                              style={{ width: `${(row.active / totalTasks) * 100}%` }}
                            />
                            <div
                              className="h-full bg-emerald-500 transition-all duration-300"
                              style={{ width: `${(row.completed / totalTasks) * 100}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column: Activity Feed */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                  Recent Activity Timeline
                </h3>
                {activityTimeline.length === 0 ? (
                  <p className="text-xs text-slate-400">No activities tracked.</p>
                ) : (
                  <div className="space-y-4">
                    {activityTimeline.map((act) => (
                      <div key={act.id} className="flex gap-3 text-xs leading-normal">
                        <span className="text-sm select-none shrink-0 pt-0.5">{act.icon}</span>
                        <div>
                          <p className="text-slate-700 font-semibold">{act.text}</p>
                          <p className="text-[9px] text-slate-400 font-medium mt-0.5">
                            {act.date.toLocaleString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "kanban" && (
            <KanbanBoard
              tasks={projectTasks}
              projects={[]}
              isAdmin={false}
              profileId={profileId}
              onStatusChange={updateTaskStatusAction}
            />
          )}

          {activeTab === "tasks" && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
              <KanbanBoard
                tasks={projectTasks}
                projects={[]}
                isAdmin={false}
                profileId={profileId}
                onStatusChange={updateTaskStatusAction}
              />
            </div>
          )}

          {activeTab === "members" && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
              <h3 className="text-sm font-bold text-slate-800">Team Members</h3>
              <div className="divide-y divide-slate-100">
                {selectedMembership.team.map((member) => {
                  const memberT = projectTasks.filter((t) => t.project_member_id === member.id);
                  const activeCount = memberT.filter((t) => t.status !== "Completed").length;
                  const completedCount = memberT.filter((t) => t.status === "Completed").length;
                  
                  const initials = member.employee?.full_name
                    ? member.employee.full_name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .substring(0, 2)
                        .toUpperCase()
                    : "??";

                  return (
                    <div
                      key={member.id}
                      className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs first:pt-0 last:pb-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                          {initials}
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-900 text-sm">
                            {member.employee?.full_name || "Unknown employee"}
                          </p>
                          <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                            {member.employee?.designation || "Staff"} • {member.employee?.department || "No Department"} • {member.member_role}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-[11px] font-bold text-slate-600">
                        <span className="bg-slate-100 px-2.5 py-1 rounded-lg">
                          {activeCount} Active Tasks
                        </span>
                        <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg border border-emerald-100">
                          {completedCount} Completed
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Original list view
  return (
    <div className="space-y-6 max-w-[1920px] mx-auto animate-fade-in">
      <PageHeader
        title="My Projects"
        description="View your assigned projects, timelines, progress, and team members."
        breadcrumbs={[{ label: "Portal", href: "/employee/dashboard" }, { label: "Projects" }]}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <EmployeeSummaryCard label="My Projects" value={queryProjects.length} />
        <EmployeeSummaryCard label="Active Projects" value={activeCount} />
        <EmployeeSummaryCard
          label="Completed Projects"
          value={completedCount}
        />
      </div>

      <div className="flex flex-col gap-2 bg-white p-2 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3">
          {/* Tab Filters */}
          <div className="flex bg-slate-105 rounded-xl border border-slate-200 w-fit shrink-0">
            <button
              type="button"
              onClick={() => setVisibilityFilter("active")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                visibilityFilter === "active"
                  ? "bg-white text-emerald-600 shadow-sm"
                  : "text-slate-550 hover:text-slate-900"
              }`}
            >
              My Active Projects
            </button>
            <button
              type="button"
              onClick={() => setVisibilityFilter("completed")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                visibilityFilter === "completed"
                  ? "bg-white text-emerald-600 shadow-sm"
                  : "text-slate-550 hover:text-slate-900"
              }`}
            >
              My Completed Projects
            </button>
            <button
              type="button"
              onClick={() => setVisibilityFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                visibilityFilter === "all"
                  ? "bg-white text-emerald-600 shadow-sm"
                  : "text-slate-550 hover:text-slate-900"
              }`}
            >
              All Projects
            </button>
          </div>
        </div>

        <div className="w-full">
          <ProjectSearch value={search} onChange={setSearch} />
        </div>
      </div>

      {filteredProjects.length === 0 ? (
        <EmptyState
          title="No assigned projects"
          description="You currently don't have any assigned projects matching your query."
          icon={<FolderKanban className="h-6 w-6 text-emerald-600" />}
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filteredProjects.map((membership) => {
            const project = membership.project;

            if (!project) {
              return null;
            }

            // Calculate progress based on actual completed vs total tasks for this project
            const projectT = tasks.filter((t) => t.project_id === project.id);
            const completedCount = projectT.filter((t) => t.status === "Completed").length;
            const progress = projectT.length > 0 ? Math.round((completedCount / projectT.length) * 100) : 0;

            const cardDerivedDepartments = (() => {
              if (!membership.team) return "";
              const counts: { [key: string]: number } = {};
              membership.team.forEach((m) => {
                const dept = m.employee?.department || "Other";
                counts[dept] = (counts[dept] || 0) + 1;
              });
              return Object.entries(counts)
                .map(([dept, count]) => `${dept} (${count})`)
                .join(", ");
            })();

            return (
              <div
                key={membership.id}
                className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs transition duration-200 hover:border-emerald-250 hover:shadow-md flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-100/60">
                        {membership.member_role}
                      </span>
                      <h2 className="mt-2 text-lg font-bold text-slate-900">
                        {project.project_name}
                      </h2>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-slate-500 font-mono">
                          {project.project_code}
                        </span>
                        {cardDerivedDepartments && (
                          <span className="text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-md border border-blue-100 font-bold">
                            {cardDerivedDepartments}
                          </span>
                        )}
                      </div>
                    </div>

                    <ProjectStatusBadge
                      status={project.status as ProjectStatus}
                    />
                  </div>

                  <p className="line-clamp-2 text-xs text-slate-600 leading-relaxed">
                    {project.description || "No description provided."}
                  </p>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold text-slate-500">
                      <span>Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 rounded-full transition-all duration-350"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <CalendarDays className="h-4 w-4 text-emerald-600" />
                    <span>
                      {formatProjectDate(project.start_date)} -{" "}
                      {formatProjectDate(project.end_date)}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProjectId(project.id);
                      setViewMode("detail");
                      setActiveTab("dashboard");
                    }}
                    className="flex items-center gap-1 font-bold text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer"
                  >
                    <UsersRound className="h-3.5 w-3.5" />
                    View Workspace
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        open={!!selectedProjectMembers}
        title={selectedProjectMembers?.project?.project_name ?? "Project Members"}
        subtitle={`Role: ${selectedProjectMembers?.member_role ?? ""}`}
        onClose={() => setSelectedProjectMembers(null)}
      >
        {selectedProjectMembers && (
          <ProjectMemberList
            members={selectedProjectMembers.team ?? []}
          />
        )}
      </Modal>
    </div>
  );
}

function EmployeeSummaryCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex items-center justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
          {label}
        </p>
        <p className="mt-1 text-2xl font-black text-slate-900">{value}</p>
      </div>

      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100/60">
        <FolderKanban className="h-5 w-5" />
      </div>
    </div>
  );
}
