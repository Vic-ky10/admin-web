"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Plus,
  Users,
  Briefcase,
  ArrowLeft,
  Clock,
  CheckCircle2,
  AlertCircle,
  Flame,
  TrendingUp,
  Award,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import PageHeader from "@/components/layout/PageHeader";
import { Employee } from "@/features/employee/employee.types";

import {
  archiveProjectAction,
  assignProjectMembersAction,
  createProjectAction,
  deleteProjectAction,
  updateProjectAction,
} from "../project.actions";
import {
  PROJECT_MEMBER_ROLE,
  PROJECT_STATUS,
  ProjectMemberRole,
  ProjectPriority,
  ProjectStatus,
  ProjectWithMembers,
} from "../project.types";
import { ProjectInput } from "../project.validation";
import ProjectFilters from "./ProjectFilters";
import ProjectForm from "./ProjectForm";
import ProjectSearch from "./ProjectSearch";
import ProjectTable from "./ProjectTable";

import KanbanBoard from "@/features/task/components/KanbanBoard";
import TaskTable from "@/features/task/components/TaskTable";
import { updateTaskStatusAction } from "@/features/task/task.action";
import { TaskWithProject } from "@/features/task/task.types";

interface AdminProjectClientProps {
  projects: ProjectWithMembers[];
  employees: Employee[];
  tasks: TaskWithProject[];
}

export default function AdminProjectClient({
  projects,
  employees,
  tasks,
}: AdminProjectClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ProjectStatus | "">("");
  const [priority, setPriority] = useState<ProjectPriority | "">("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "az" | "za">(
    "newest",
  );

  // View mode switcher
  const [viewMode, setViewMode] = useState<"list" | "detail">("list");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null,
  );
  const [visibilityFilter, setVisibilityFilter] = useState<
    "active" | "completed" | "all"
  >("active");

  // Workspace tabs
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "kanban" | "tasks" | "members"
  >("dashboard");

  const [formProject, setFormProject] = useState<ProjectWithMembers | null>(
    null,
  );
  const [formOpen, setFormOpen] = useState(false);
  const [assignProject, setAssignProject] = useState<ProjectWithMembers | null>(
    null,
  );
  const [projectToDelete, setProjectToDelete] =
    useState<ProjectWithMembers | null>(null);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [memberRole, setMemberRole] = useState<ProjectMemberRole>(
    PROJECT_MEMBER_ROLE.DEVELOPER,
  );
  const [isPending, startTransition] = useTransition();

  const { data: queryProjects } = useQuery({
    queryKey: ["projects", projects.length],
    queryFn: async () => projects,
    initialData: projects,
  });

  const filteredProjects = useMemo(() => {
    const keyword = search.toLowerCase();

    return queryProjects.filter((project) => {
      const matchesSearch =
        !keyword ||
        project.project_name.toLowerCase().includes(keyword) ||
        project.project_code.toLowerCase().includes(keyword) ||
        (project.description &&
          project.description.toLowerCase().includes(keyword));

      const matchesPriority = !priority || project.priority === priority;

    
      let matchesVisibility = true;
      if (visibilityFilter === "active") {
        matchesVisibility =
          project.status !== "Completed" &&
          project.status !== "Archived" &&
          project.status !== "Cancelled";
      } else if (visibilityFilter === "completed") {
        matchesVisibility = project.status === "Completed";
      } else if (visibilityFilter === "all") {
        matchesVisibility = project.status !== "Archived";
      }

    
      const matchesStatus = !status
        ? matchesVisibility
        : project.status === status;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [priority, queryProjects, search, status, visibilityFilter]);

  const sortedProjects = useMemo(() => {
    return [...filteredProjects].sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );

        case "oldest":
          return (
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );

        case "az":
          return a.project_name.localeCompare(b.project_name);

        case "za":
          return b.project_name.localeCompare(a.project_name);

        default:
          return 0;
      }
    });
  }, [filteredProjects, sortBy]);

  // Selected project details lookup
  const selectedProject = useMemo(() => {
    if (!selectedProjectId) return null;
    return queryProjects.find((p) => p.id === selectedProjectId) || null;
  }, [queryProjects, selectedProjectId]);

  // Tasks for the selected project
  const projectTasks = useMemo(() => {
    if (!selectedProjectId) return [];
    return tasks.filter((t) => t.project_id === selectedProjectId);
  }, [tasks, selectedProjectId]);

  function openCreate() {
    setFormProject(null);
    setFormOpen(true);
  }

  function openEdit(project: ProjectWithMembers) {
    setFormProject(project);
    setFormOpen(true);
  }

  function openAssign(project: ProjectWithMembers) {
    setAssignProject(project);
    // Pre-select existing member IDs to toggle assignments
    const activeMemberIds = project.members.map((m) => m.profile_id);
    setSelectedEmployees(activeMemberIds);
    setMemberRole(PROJECT_MEMBER_ROLE.DEVELOPER);
  }

  function handleSaveProject(values: ProjectInput) {
    startTransition(async () => {
      const result = formProject
        ? await updateProjectAction(formProject.id, values)
        : await createProjectAction(values);

      if (!result.success) {
        toast.error(result.error ?? "Unable to save project.");
        return;
      }

      toast.success(result.message ?? "Project saved successfully.");
      setFormOpen(false);
      setFormProject(null);
      router.refresh();
    });
  }

  function handleArchive(project: ProjectWithMembers) {
    startTransition(async () => {
      const result = await archiveProjectAction(project.id);
      if (!result.success) {
        toast.error(result.error ?? "Unable to archive project.");
        return;
      }
      toast.success(result.message ?? "Project archived.");
      router.refresh();
    });
  }

  function handleDelete() {
    if (!projectToDelete) return;
    startTransition(async () => {
      const result = await deleteProjectAction(projectToDelete.id);
      if (!result.success) {
        toast.error(result.error ?? "Unable to delete project.");
        return;
      }
      toast.success(result.message ?? "Project deleted.");
      setProjectToDelete(null);
   
      if (selectedProjectId === projectToDelete.id) {
        setViewMode("list");
        setSelectedProjectId(null);
      }
      router.refresh();
    });
  }

  function handleAssign() {
    if (!assignProject) return;

    startTransition(async () => {
      const result = await assignProjectMembersAction({
        projectId: assignProject.id,
        profileIds: selectedEmployees,
        member_role: memberRole,
      });

      if (!result.success) {
        toast.error(result.error ?? "Unable to assign employees.");
        return;
      }

      toast.success(result.message ?? "Employees assigned.");
      setAssignProject(null);
      setSelectedEmployees([]);
      router.refresh();
    });
  }

  function toggleEmployee(profileId: string) {
    setSelectedEmployees((current) =>
      current.includes(profileId)
        ? current.filter((id) => id !== profileId)
        : [...current, profileId],
    );
  }


  const employeesByDepartment = useMemo(() => {
    const groups: { [key: string]: Employee[] } = {};
    employees.forEach((emp) => {
      const dept = emp.department || "Other";
      if (!groups[dept]) groups[dept] = [];
      groups[dept].push(emp);
    });
    return groups;
  }, [employees]);


  const stats = useMemo(() => {
    if (projectTasks.length === 0) {
      return {
        completed: 0,
        open: 0,
        overdue: 0,
        highPriority: 0,
        percent: 0,
        health: "Healthy" as "Healthy" | "At Risk" | "Delayed",
        healthColor: "text-emerald-600 bg-emerald-50 border-emerald-150",
        healthBullet: "🟢",
      };
    }

    const completed = projectTasks.filter(
      (t) => t.status === "Completed",
    ).length;
    const open = projectTasks.filter((t) => t.status !== "Completed").length;
    const highPriority = projectTasks.filter(
      (t) => t.priority === "High" || t.priority === "Urgent",
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

    return {
      completed,
      open,
      overdue,
      highPriority,
      percent,
      health,
      healthColor,
      healthBullet,
    };
  }, [projectTasks]);

  // Workload distribution data (Heatmap)
  const workloadData = useMemo(() => {
    if (!selectedProject) return [];

    return selectedProject.members
      .map((member) => {
        const memberTasks = projectTasks.filter(
          (t) => t.project_member_id === member.id,
        );
        const activeTasksCount = memberTasks.filter(
          (t) => t.status !== "Completed",
        ).length;
        const completedTasksCount = memberTasks.filter(
          (t) => t.status === "Completed",
        ).length;

        return {
          memberId: member.id,
          name: member.employee?.full_name || "Unknown employee",
          role: member.member_role,
          designation: member.employee?.designation || "Staff",
          total: memberTasks.length,
          active: activeTasksCount,
          completed: completedTasksCount,
        };
      })
      .sort((a, b) => b.total - a.total);
  }, [selectedProject, projectTasks]);

  // Top Contributors Leaderboard
  const leaderboard = useMemo(() => {
    return workloadData
      .filter((w) => w.completed > 0)
      .sort((a, b) => b.completed - a.completed)
      .slice(0, 3);
  }, [workloadData]);

  // Overdue tasks list
  const overdueTasksList = useMemo(() => {
    const today = new Date();
    return projectTasks
      .filter((t) => {
        if (t.status === "Completed" || !t.due_date) return false;
        return new Date(t.due_date) < today;
      })
      .map((t) => {
        const msDiff = today.getTime() - new Date(t.due_date!).getTime();
        const daysLate = Math.max(
          1,
          Math.floor(msDiff / (1000 * 60 * 60 * 24)),
        );
        return {
          id: t.id,
          title: t.title,
          assignee: t.member?.profile?.full_name || "Unassigned",
          daysLate,
        };
      })
      .sort((a, b) => b.daysLate - a.daysLate);
  }, [projectTasks]);

  // Activity feed timeline generator
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

      // 3. In Progress event 
      if (
        task.status === "In Progress" &&
        task.updated_at !== task.created_at
      ) {
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
      .slice(0, 15); // limit to 15 items
  }, [projectTasks]);



  // Render detail view workspace
  if (viewMode === "detail" && selectedProject) {
    const progressText = `${stats.completed} / ${projectTasks.length} Tasks`;

    const derivedDepartments = (() => {
      if (!selectedProject.members) return "";
      const counts: { [key: string]: number } = {};
      selectedProject.members.forEach((m) => {
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
                Timeline:{" "}
                {new Date(selectedProject.start_date).toLocaleDateString(
                  "en-IN",
                  {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  },
                )}{" "}
                -{" "}
                {selectedProject.end_date
                  ? new Date(selectedProject.end_date).toLocaleDateString(
                      "en-IN",
                      {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      },
                    )
                  : "No end date"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => openEdit(selectedProject)}
            >
              Edit Project
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => openAssign(selectedProject)}
            >
              Manage Team
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                setProjectToDelete(selectedProject);
              }}
            >
              Delete
            </Button>
          </div>
        </div>

        {/* 6 Workspace Stats Widgets */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          {/* Progress widget */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex flex-col justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Progress
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-black text-slate-900">
                {stats.percent}%
              </span>
              <span className="text-[10px] font-semibold text-slate-400">
                {progressText}
              </span>
            </div>
            <div className="mt-2.5 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-350"
                style={{ width: `${stats.percent}%` }}
              />
            </div>
          </div>

          {/* Health widget */}
          <div
            className={`rounded-2xl border p-5 shadow-xs flex flex-col justify-between ${stats.healthColor}`}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-85">
              Health Status
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-black">{stats.health}</span>
              <span className="text-xs">{stats.healthBullet}</span>
            </div>
            <span className="text-[10px] font-semibold mt-2.5 opacity-80">
              {stats.overdue} Overdue tasks remaining
            </span>
          </div>

          {/* Members count */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex flex-col justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Team Members
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-black text-slate-900">
                {selectedProject.members.length}
              </span>
              <Users className="h-4 w-4 text-slate-400" />
            </div>
            <span className="text-[10px] font-semibold mt-2.5 text-slate-400">
              Active staff members
            </span>
          </div>

          {/* Open Tasks */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex flex-col justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Open Tasks
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-black text-slate-900">
                {stats.open}
              </span>
              <Clock className="h-4 w-4 text-slate-400" />
            </div>
            <span className="text-[10px] font-semibold mt-2.5 text-slate-400">
              Todo and In Progress items
            </span>
          </div>

          {/* Completed tasks */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex flex-col justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Completed Tasks
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-black text-slate-900">
                {stats.completed}
              </span>
              <CheckCircle2 className="h-4 w-4 text-slate-400" />
            </div>
            <span className="text-[10px] font-semibold mt-2.5 text-slate-400">
              Finished project scopes
            </span>
          </div>

          {/* High Priority Tasks */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex flex-col justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              High Priority
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-black text-slate-900">
                {stats.highPriority}
              </span>
              <AlertCircle className="h-4 w-4 text-slate-400" />
            </div>
            <span className="text-[10px] font-semibold mt-2.5 text-slate-400">
              High / Urgent milestones
            </span>
          </div>
        </div>

        {/* 100% Celebration Banner */}
        {stats.percent === 100 && projectTasks.length > 0 && (
          <div className="relative overflow-hidden rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm transition-all duration-300 animate-fade-in">
            {/* Decorative Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-50 via-white to-cyan-50 opacity-90" />
            <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-emerald-100 blur-3xl opacity-60" />
            <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-cyan-100 blur-3xl opacity-60" />

            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-2">
                <h2 className="flex items-center gap-2 text-lg font-black text-gray-800">
                  🎉 Project Completed Successfully!
                </h2>

                <p className="max-w-xl text-sm leading-relaxed text-gray-600">
                  All assigned tasks have been successfully completed. Excellent
                  work by
                  <span className="font-semibold text-emerald-700">
                    {" "}
                    {selectedProject.members
                      .map((m) => m.employee?.full_name)
                      .join(", ")}
                  </span>
                  . The project was completed on{" "}
                  <span className="font-semibold text-gray-800">
                    {new Date().toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  .
                </p>
              </div>

              <div className="shrink-0 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-bold text-emerald-700 shadow-sm">
                ✅ 100% COMPLETE
              </div>
            </div>
          </div>
        )}

        {/* Tabs switcher */}
        <div className="border-b border-slate-200">
          <nav className="flex gap-6">
            {(["dashboard", "kanban", "tasks", "members"] as const).map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-3 text-sm font-bold border-b-2 transition duration-150 cursor-pointer capitalize ${
                    activeTab === tab
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300"
                  }`}
                >
                  {tab === "tasks"
                    ? "Task List"
                    : tab === "kanban"
                      ? "Kanban Board"
                      : tab}
                </button>
              ),
            )}
          </nav>
        </div>

        {/* Tab contents */}
        <div className="space-y-6">
          {activeTab === "dashboard" && (
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Left 2 Columns: Heatmap, Leaderboard, Overdue list */}
              <div className="lg:col-span-2 space-y-6">
                {/* Heatmap & workload distribution */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <Flame className="h-4 w-4 text-orange-500" />
                    Workload Distribution Heatmap
                  </h3>
                  {workloadData.length === 0 ? (
                    <p className="text-xs text-slate-400">
                      No members assigned to show distribution.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {workloadData.map((row) => {
                        const totalTasks = projectTasks.length || 1;

                        return (
                          <div key={row.memberId} className="space-y-1">
                            <div className="flex justify-between text-xs font-semibold text-slate-700">
                              <div>
                                <span className="font-bold text-slate-900">
                                  {row.name}
                                </span>
                                <span className="text-[11px] text-slate-400 font-medium ml-2">
                                  {row.designation} ({row.role})
                                </span>
                              </div>
                              <span className="font-mono text-xs">
                                {row.total} Tasks ({row.active} Active)
                              </span>
                            </div>
                            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
                              <div
                                className="h-full bg-blue-500 transition-all duration-300"
                                style={{
                                  width: `${(row.active / totalTasks) * 100}%`,
                                }}
                                title="Active Tasks"
                              />
                              <div
                                className="h-full bg-emerald-500 transition-all duration-300"
                                style={{
                                  width: `${(row.completed / totalTasks) * 100}%`,
                                }}
                                title="Completed Tasks"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Overdue tasks warning panel */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
                  <h3 className="text-sm font-bold text-rose-600 flex items-center gap-1.5">
                   
                    ⚠️ Overdue Tasks
                  </h3>
                  {overdueTasksList.length === 0 ? (
                    <p className="text-xs text-slate-400">
                      🎉 No overdue tasks. Everything is running healthy.
                    </p>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {overdueTasksList.map((t) => (
                        <div
                          key={t.id}
                          className="py-3 flex justify-between items-center text-xs first:pt-0 last:pb-0"
                        >
                          <div>
                            <p className="font-bold text-slate-800">
                              {t.title}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              Assigned to {t.assignee}
                            </p>
                          </div>
                          <span className="text-rose-600 font-bold bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-100 animate-pulse shrink-0">
                            {t.daysLate} {t.daysLate === 1 ? "Day" : "Days"}{" "}
                            Late
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Gamified Leaderboard */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <Award className="h-4 w-4 text-yellow-500" />
                    Top Contributors Leaderboard
                  </h3>
                  {leaderboard.length === 0 ? (
                    <p className="text-xs text-slate-400">
                      No completed tasks yet. Keep pushing!
                    </p>
                  ) : (
                    <div className="grid sm:grid-cols-3 gap-4">
                      {leaderboard.map((row, index) => {
                        const medal =
                          index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉";
                        const medalBg =
                          index === 0
                            ? "bg-amber-50 text-amber-700 border-amber-100"
                            : index === 1
                              ? "bg-slate-100 text-slate-700 border-slate-200"
                              : "bg-orange-50/50 text-orange-700 border-orange-100";

                        return (
                          <div
                            key={row.memberId}
                            className={`rounded-xl border p-4 flex flex-col items-center text-center space-y-2 shadow-xs ${medalBg}`}
                          >
                            <span className="text-2xl">{medal}</span>
                            <div>
                              <p className="font-extrabold text-xs text-slate-900">
                                {row.name}
                              </p>
                              <p className="text-[10px] text-slate-500 font-medium">
                                {row.designation}
                              </p>
                            </div>
                            <span className="font-bold text-xs bg-white/70 px-2.5 py-0.5 rounded-full border border-white">
                              {row.completed} Tasks Done
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

             
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4 h-fit">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                  Recent Activity Timeline
                </h3>
                {activityTimeline.length === 0 ? (
                  <p className="text-xs text-slate-400">
                    No activities tracked on this project.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {activityTimeline.map((act) => (
                      <div
                        key={act.id}
                        className="flex gap-3 text-xs leading-normal"
                      >
                        <span className="text-sm select-none shrink-0 pt-0.5">
                          {act.icon}
                        </span>
                        <div>
                          <p className="text-slate-700 font-semibold">
                            {act.text}
                          </p>
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
              projects={[selectedProject]}
              isAdmin={true}
              onStatusChange={updateTaskStatusAction}
            />
          )}

          {activeTab === "tasks" && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
              <TaskTable tasks={projectTasks} projects={[selectedProject]} />
            </div>
          )}

          {activeTab === "members" && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-800">
                  Project Members Grouped
                </h3>
                <Button size="sm" onClick={() => openAssign(selectedProject)}>
                  Manage Team Members
                </Button>
              </div>

              {selectedProject.members.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
                  No employees assigned to this project yet.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {selectedProject.members.map((member) => {
                    const memberT = projectTasks.filter(
                      (t) => t.project_member_id === member.id,
                    );
                    const activeCount = memberT.filter(
                      (t) => t.status !== "Completed",
                    ).length;
                    const completedCount = memberT.filter(
                      (t) => t.status === "Completed",
                    ).length;

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
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                            {initials}
                          </div>
                          <div>
                            <p className="font-extrabold text-slate-900 text-sm">
                              {member.employee?.full_name || "Unknown employee"}
                            </p>
                            <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                              {member.employee?.designation || "Staff"} •{" "}
                              {member.employee?.department || "No Department"} •{" "}
                              {member.member_role}
                            </p>
                          </div>
                        </div>

                        {/* Member stats */}
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
              )}
            </div>
          )}
        </div>

        {/* Existing modals */}
        <Modal
          open={formOpen}
          title={formProject ? "Edit Project" : "Create Project"}
          subtitle="Specify project parameters, dates, and priorities."
          onClose={() => setFormOpen(false)}
        >
          <ProjectForm
            project={formProject}
            onSubmit={handleSaveProject}
            onCancel={() => setFormOpen(false)}
            loading={isPending}
          />
        </Modal>

      
        <Modal
          open={!!assignProject}
          title="Assign Team Members"
          subtitle={`Assign staff to ${assignProject?.project_name ?? ""}`}
          onClose={() => setAssignProject(null)}
        >
          {assignProject && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Select Project Role
                </label>
                <select
                  value={memberRole}
                  onChange={(e) =>
                    setMemberRole(e.target.value as ProjectMemberRole)
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm text-slate-900 shadow-xs outline-none focus:ring-2 focus:ring-blue-100"
                >
                  {Object.values(PROJECT_MEMBER_ROLE).map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Grouped Available Staff
                </label>
                <div className="max-h-80 overflow-y-auto space-y-4 pr-1">
                  {Object.entries(employeesByDepartment).map(
                    ([dept, deptEmployees]) => (
                      <div key={dept} className="space-y-2">
                        <h4 className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md uppercase tracking-wider border border-slate-150">
                          {dept} ({deptEmployees.length})
                        </h4>
                        <div className="space-y-2">
                          {deptEmployees.map((emp) => {
                            const isSelected = selectedEmployees.includes(
                              emp.id,
                            );
                            const initials = emp.full_name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .substring(0, 2)
                              .toUpperCase();

                            return (
                              <div
                                key={emp.id}
                                onClick={() => toggleEmployee(emp.id)}
                                className={[
                                  "flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all duration-150",
                                  isSelected
                                    ? "border-blue-500 bg-blue-50/40 shadow-xs scale-[1.01]"
                                    : "border-slate-100 hover:bg-slate-50",
                                ].join(" ")}
                              >
                                <div className="flex items-center gap-3">
                                  <div className="h-8 w-8 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold text-xs">
                                    {initials}
                                  </div>
                                  <div>
                                    <p className="text-xs font-bold text-slate-900">
                                      {emp.full_name}
                                    </p>
                                    <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                                      {emp.designation || "Staff"} •{" "}
                                      {emp.employee_id}
                                    </p>
                                  </div>
                                </div>
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => {}}
                                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <Button
                  variant="secondary"
                  onClick={() => setAssignProject(null)}
                >
                  Cancel
                </Button>
                <Button onClick={handleAssign} disabled={isPending}>
                  Save Assignments
                </Button>
              </div>
            </div>
          )}
        </Modal>

        {/* delete Confirmation Modal */}
        <Modal
          open={!!projectToDelete}
          title="Confirm Delete"
          subtitle="Are you sure you want to delete this project?"
          onClose={() => setProjectToDelete(null)}
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Deleting{" "}
              <span className="font-bold text-slate-900">
                {projectToDelete?.project_name}
              </span>{" "}
              is permanent and cannot be undone.
            </p>
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button
                variant="secondary"
                onClick={() => setProjectToDelete(null)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                disabled={isPending}
              >
                Delete Project
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    );
  }

  // Original list view
  const activeProjects = queryProjects.filter(
    (project) => project.status === PROJECT_STATUS.ACTIVE,
  );

  return (
    <div className="space-y-6 max-w-[1920px] mx-auto animate-fade-in">
      <PageHeader
        title="Projects"
        description="Create projects, manage assignments, and keep team access aligned."
        breadcrumbs={[
          { label: "Admin", href: "/dashboard" },
          { label: "Projects" },
        ]}
      >
        <Button onClick={openCreate} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Project
        </Button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard label="Total Projects" value={queryProjects.length} />
        <SummaryCard label="Active Projects" value={activeProjects.length} />
        <SummaryCard
          label="Archived Projects"
          value={
            queryProjects.filter(
              (project) => project.status === PROJECT_STATUS.ARCHIVED,
            ).length
          }
        />
      </div>

      <div className="flex flex-col gap-2 bg-white p-2 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3">
          {/* Tab Filters */}
          <div className="flex bg-slate-105 rounded-xl border border-slate-200 w-fit">
            <button
              type="button"
              onClick={() => setVisibilityFilter("active")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                visibilityFilter === "active"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-550 hover:text-slate-900"
              }`}
            >
              Active
            </button>
            <button
              type="button"
              onClick={() => setVisibilityFilter("completed")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                visibilityFilter === "completed"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-550 hover:text-slate-900"
              }`}
            >
              Completed
            </button>
            <button
              type="button"
              onClick={() => setVisibilityFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                visibilityFilter === "all"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-550 hover:text-slate-900"
              }`}
            >
              All Projects
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto mt-3 sm:mt-0">
            <ProjectFilters
              status={status}
              priority={priority}
              onStatusChange={setStatus}
              onPriorityChange={setPriority}
            />

            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as "newest" | "oldest" | "az" | "za")
              }
              className="h-10 w-full sm:w-[130px] rounded-lg border border-slate-200 bg-white px-3 text-sm shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="newest">Sort: Recent</option>
              <option value="oldest">Sort: Oldest</option>
              <option value="az">Sort: A-Z</option>
              <option value="za">Sort: Z-A</option>
            </select>
          </div>
        </div>

        <div className="w-full">
          <ProjectSearch value={search} onChange={setSearch} />
        </div>
      </div>

      <ProjectTable
        projects={sortedProjects}
        onView={(project) => {
          setSelectedProjectId(project.id);
          setViewMode("detail");
          setActiveTab("dashboard");
        }}
        onEdit={openEdit}
        onArchive={handleArchive}
        onDelete={setProjectToDelete}
      />

      <Modal
        open={formOpen}
        title={formProject ? "Edit Project" : "Create Project"}
        subtitle="Specify project parameters, dates, and priorities."
        onClose={() => setFormOpen(false)}
      >
        <ProjectForm
          project={formProject}
          onSubmit={handleSaveProject}
          onCancel={() => setFormOpen(false)}
          loading={isPending}
        />
      </Modal>

      <Modal
        open={!!projectToDelete}
        title="Confirm Delete"
        subtitle="Are you sure you want to delete this project?"
        onClose={() => setProjectToDelete(null)}
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Deleting{" "}
            <span className="font-bold text-slate-900">
              {projectToDelete?.project_name}
            </span>{" "}
            is permanent and cannot be undone.
          </p>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              variant="secondary"
              onClick={() => setProjectToDelete(null)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              disabled={isPending}
            >
              Delete Project
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex items-center justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
          {label}
        </p>
        <p className="mt-1 text-2xl font-black text-slate-900">{value}</p>
      </div>
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
        <Briefcase className="h-5 w-5" />
      </div>
    </div>
  );
}
