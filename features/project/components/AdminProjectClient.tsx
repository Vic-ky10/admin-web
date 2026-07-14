"use client";

import { useQuery } from "@tanstack/react-query";
import { Plus, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { Employee } from "@/features/employee/employee.types";

import {
  archiveProjectAction,
  assignProjectMembersAction,
  createProjectAction,
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
import ProjectCard from "./ProjectCard";
import ProjectFilters from "./ProjectFilters";
import ProjectForm from "./ProjectForm";
import ProjectMemberList from "./ProjectMemberList";
import ProjectSearch from "./ProjectSearch";
import ProjectTable from "./ProjectTable";

interface AdminProjectClientProps {
  projects: ProjectWithMembers[];
  employees: Employee[];
}

export default function AdminProjectClient({
  projects,
  employees,
}: AdminProjectClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ProjectStatus | "">("");
  const [priority, setPriority] = useState<ProjectPriority | "">("");
  const [formProject, setFormProject] = useState<ProjectWithMembers | null>(
    null
  );
  const [formOpen, setFormOpen] = useState(false);
  const [selectedProject, setSelectedProject] =
    useState<ProjectWithMembers | null>(null);
  const [assignProject, setAssignProject] =
    useState<ProjectWithMembers | null>(null);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [memberRole, setMemberRole] = useState<ProjectMemberRole>(
    PROJECT_MEMBER_ROLE.DEVELOPER
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
        project.description?.toLowerCase().includes(keyword);
      const matchesStatus = !status || project.status === status;
      const matchesPriority = !priority || project.priority === priority;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [priority, queryProjects, search, status]);

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
    setSelectedEmployees([]);
    setMemberRole(PROJECT_MEMBER_ROLE.DEVELOPER);
  }

  function handleSubmit(values: ProjectInput) {
    startTransition(async () => {
      const result = formProject
        ? await updateProjectAction(formProject.id, values)
        : await createProjectAction(values);

      if (!result.success) {
        toast.error(result.error ?? "Unable to save project.");
        return;
      }

      toast.success(result.message ?? "Project saved.");
      setFormOpen(false);
      setFormProject(null);
      router.refresh();
    });
  }

  function handleArchive(project: ProjectWithMembers) {
    startTransition(async () => {
      const result = await archiveProjectAction({ projectId: project.id });

      if (!result.success) {
        toast.error(result.error ?? "Unable to archive project.");
        return;
      }

      toast.success(result.message ?? "Project archived.");
      router.refresh();
    });
  }

  function handleAssign() {
    if (!assignProject) {
      return;
    }

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
        : [...current, profileId]
    );
  }

  const activeProjects = queryProjects.filter(
    (project) => project.status === PROJECT_STATUS.ACTIVE
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
            Project Management
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">Projects</h1>
          <p className="mt-2 max-w-2xl text-slate-500">
            Create projects, manage assignments, and keep employee project
            access aligned with the current team.
          </p>
        </div>

        <Button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Project
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard label="Total Projects" value={queryProjects.length} />
        <SummaryCard label="Active Projects" value={activeProjects.length} />
        <SummaryCard
          label="Archived Projects"
          value={
            queryProjects.filter(
              (project) => project.status === PROJECT_STATUS.ARCHIVED
            ).length
          }
        />
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1fr_420px]">
          <ProjectSearch value={search} onChange={setSearch} />
          <ProjectFilters
            status={status}
            priority={priority}
            onStatusChange={setStatus}
            onPriorityChange={setPriority}
          />
        </div>
      </div>

      {filteredProjects.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            No projects found
          </h2>
          <p className="mt-2 text-slate-500">
            Projects matching your search and filters will appear here.
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 xl:grid-cols-3">
            {filteredProjects.slice(0, 3).map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
          <ProjectTable
            projects={filteredProjects}
            onView={setSelectedProject}
            onEdit={openEdit}
            onArchive={handleArchive}
          />
        </>
      )}

      <Modal
        open={formOpen}
        title={formProject ? "Edit Project" : "Create Project"}
        onClose={() => setFormOpen(false)}
      >
        <ProjectForm
          project={formProject}
          onSubmit={handleSubmit}
          onCancel={() => setFormOpen(false)}
          loading={isPending}
        />
      </Modal>

      <Modal
        open={selectedProject !== null}
        title={selectedProject?.project_name ?? "Project Details"}
        onClose={() => setSelectedProject(null)}
      >
        {selectedProject && (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Detail label="Project Code" value={selectedProject.project_code} />
              <Detail label="Status" value={selectedProject.status} />
              <Detail label="Priority" value={selectedProject.priority} />
              <Detail
                label="Timeline"
                value={`${selectedProject.start_date} - ${
                  selectedProject.end_date ?? "Not set"
                }`}
              />
            </div>

            <div>
              <h3 className="font-semibold text-slate-900">Description</h3>
              <p className="mt-2 text-sm text-slate-500">
                {selectedProject.description || "No description added."}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button type="button" onClick={() => openAssign(selectedProject)}>
                <Users className="mr-2 h-4 w-4" />
                Assign Employees
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => openEdit(selectedProject)}
              >
                Edit Project
              </Button>
            </div>

            <ProjectMemberList
              members={selectedProject.members}
              canManage
              onChanged={() => router.refresh()}
            />
          </div>
        )}
      </Modal>

      <Modal
        open={assignProject !== null}
        title="Assign Employees"
        onClose={() => setAssignProject(null)}
      >
        <div className="space-y-5">
          <label className="space-y-1">
            <span className="text-sm font-semibold text-slate-700">
              Member Role
            </span>
            <select
              value={memberRole}
              onChange={(event) =>
                setMemberRole(event.target.value as ProjectMemberRole)
              }
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              {Object.values(PROJECT_MEMBER_ROLE).map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </label>

          <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
            {employees.map((employee) => {
              const alreadyAssigned = assignProject?.members.some(
                (member) => member.profile_id === employee.id
              );

              return (
                <label
                  key={employee.id}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition hover:border-blue-200 hover:bg-blue-50/40"
                >
                  <input
                    type="checkbox"
                    checked={
                      alreadyAssigned || selectedEmployees.includes(employee.id)
                    }
                    disabled={alreadyAssigned}
                    onChange={() => toggleEmployee(employee.id)}
                    className="h-4 w-4 accent-blue-600"
                  />
                  <span className="min-w-0">
                    <span className="block font-medium text-slate-900">
                      {employee.full_name}
                    </span>
                    <span className="block truncate text-sm text-slate-500">
                      {employee.employee_id} | {employee.department ?? "No department"}
                      {alreadyAssigned ? " | Already assigned" : ""}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setAssignProject(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={isPending || selectedEmployees.length === 0}
              onClick={handleAssign}
            >
              Assign Selected
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-bold text-slate-950">{value}</p>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 font-medium text-slate-900">{value}</p>
    </div>
  );
}
