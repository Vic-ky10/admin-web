"use client";

import { useQuery } from "@tanstack/react-query";
import { CalendarDays, UsersRound, FolderKanban } from "lucide-react";
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
  calculateTimelineProgress,
  formatProjectDate,
} from "../project.utils";
import ProjectMemberList from "./ProjectMemberList";
import ProjectSearch from "./ProjectSearch";
import { ProjectStatusBadge } from "./ProjectStatusBadge";

interface EmployeeProjectClientProps {
  projects: EmployeeProject[];
}

export default function EmployeeProjectClient({
  projects,
}: EmployeeProjectClientProps) {
  const [search, setSearch] = useState("");
  const [selectedProject, setSelectedProject] =
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

      return (
        project?.project_name.toLowerCase().includes(keyword) ||
        project?.project_code.toLowerCase().includes(keyword) ||
        project?.description?.toLowerCase().includes(keyword)
      );
    });
  }, [queryProjects, search]);

  const activeCount = queryProjects.filter(
    (membership) => membership.project?.status === PROJECT_STATUS.ACTIVE
  ).length;
  const completedCount = queryProjects.filter(
    (membership) => membership.project?.status === PROJECT_STATUS.COMPLETED
  ).length;

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

      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
        <div className="w-full sm:w-80">
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

            const progress = calculateTimelineProgress({
              startDate: project.start_date,
              endDate: project.end_date,
              progress: project.progress,
            });

            return (
              <div
                key={membership.id}
                className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs transition duration-200 hover:border-emerald-200 hover:shadow-md flex flex-col justify-between"
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
                      <p className="text-xs text-slate-500 font-mono">
                        {project.project_code}
                      </p>
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
                        className="h-full bg-emerald-600 rounded-full transition-all duration-300"
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
                    onClick={() => setSelectedProject(membership)}
                    className="flex items-center gap-1 font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                  >
                    <UsersRound className="h-3.5 w-3.5" />
                    {membership.team?.length ?? 0} Members
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        open={!!selectedProject}
        title={selectedProject?.project?.project_name ?? "Project Members"}
        subtitle={`Role: ${selectedProject?.member_role ?? ""}`}
        onClose={() => setSelectedProject(null)}
      >
        {selectedProject && (
          <ProjectMemberList
            members={selectedProject.team ?? []}
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
