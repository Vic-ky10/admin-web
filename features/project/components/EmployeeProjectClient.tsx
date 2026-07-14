"use client";

import { useQuery } from "@tanstack/react-query";
import { CalendarDays, UsersRound } from "lucide-react";
import { useMemo, useState } from "react";

import Modal from "@/components/ui/Modal";

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
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
          My Work
        </p>
        <h1 className="mt-2 text-3xl font-bold">Projects</h1>
        <p className="mt-2 text-slate-500">
          View assigned projects, timelines, and team members.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <EmployeeSummaryCard label="My Projects" value={queryProjects.length} />
        <EmployeeSummaryCard label="Active Projects" value={activeCount} />
        <EmployeeSummaryCard
          label="Completed Projects"
          value={completedCount}
        />
      </div>

      <div className="rounded-lg border border-emerald-100 bg-white p-4 shadow-sm">
        <div className="[&_input:focus]:border-emerald-500 [&_input:focus]:ring-emerald-100">
          <ProjectSearch value={search} onChange={setSearch} />
        </div>
      </div>

      {filteredProjects.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center">
          <h2 className="text-lg font-semibold">No assigned projects</h2>
          <p className="mt-2 text-slate-500">
            Assigned projects will appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filteredProjects.map((membership) => {
            const project = membership.project;

            if (!project) {
              return null;
            }

            return (
              <button
                key={membership.id}
                type="button"
                onClick={() => setSelectedProject(membership)}
                className="rounded-lg border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-100/70"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                      {project.project_code}
                    </p>
                    <h2 className="mt-2 text-xl font-semibold">
                      {project.project_name}
                    </h2>
                  </div>
                  <ProjectStatusBadge status={project.status as ProjectStatus} />
                </div>
                <p className="mt-3 line-clamp-2 text-sm text-slate-500">
                  {project.description || "No description added."}
                </p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <ProjectMeta
                    icon={<CalendarDays className="h-4 w-4" />}
                    label="Timeline"
                    value={`${formatProjectDate(project.start_date)} - ${formatProjectDate(
                      project.end_date
                    )}`}
                  />
                  <ProjectMeta
                    icon={<UsersRound className="h-4 w-4" />}
                    label="Team"
                    value={`${membership.team.length} member(s)`}
                  />
                </div>
              </button>
            );
          })}
        </div>
      )}

      <Modal
        open={selectedProject !== null}
        title={selectedProject?.project?.project_name ?? "Project Details"}
        onClose={() => setSelectedProject(null)}
      >
        {selectedProject?.project && (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Detail
                label="Project Code"
                value={selectedProject.project.project_code}
              />
              <Detail label="Status" value={selectedProject.project.status} />
              <Detail
                label="Priority"
                value={selectedProject.project.priority}
              />
              <Detail
                label="Timeline"
                value={`${formatProjectDate(
                  selectedProject.project.start_date
                )} - ${formatProjectDate(selectedProject.project.end_date)}`}
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">Timeline</h3>
                <span className="text-sm text-slate-400">
                  {selectedProject.project.progress}%
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{
                    width: `${calculateTimelineProgress({
                      startDate: selectedProject.project.start_date,
                      endDate: selectedProject.project.end_date,
                      progress: selectedProject.project.progress,
                    })}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <h3 className="mb-3 font-semibold text-slate-900">
                Team Members
              </h3>
              <ProjectMemberList members={selectedProject.team} />
            </div>
          </div>
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
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function ProjectMeta({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3">
      <span className="text-emerald-600">{icon}</span>
      <span>
        <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
          {label}
        </span>
        <span className="block text-sm font-medium text-slate-800">
          {value}
        </span>
      </span>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-emerald-100 bg-emerald-50/50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 font-medium text-slate-900">{value}</p>
    </div>
  );
}
