"use client";

import { useQuery } from "@tanstack/react-query";
import { Plus, Users, Briefcase } from "lucide-react";
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
  const [formProject, setFormProject] = useState<ProjectWithMembers | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectWithMembers | null>(null);
  const [assignProject, setAssignProject] = useState<ProjectWithMembers | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<ProjectWithMembers | null>(null);
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
        : [...current, profileId]
    );
  }

  const activeProjects = queryProjects.filter(
    (project) => project.status === PROJECT_STATUS.ACTIVE
  );

  return (
    <div className="space-y-6 max-w-[1920px] mx-auto animate-fade-in">
      <PageHeader
        title="Projects"
        description="Create projects, manage assignments, and keep team access aligned."
        breadcrumbs={[{ label: "Admin", href: "/dashboard" }, { label: "Projects" }]}
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
              (project) => project.status === PROJECT_STATUS.ARCHIVED
            ).length
          }
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="w-full sm:w-72">
          <ProjectSearch value={search} onChange={setSearch} />
        </div>

        <div className="flex items-center gap-3">
          <ProjectFilters
            status={status}
            priority={priority}
            onStatusChange={setStatus}
            onPriorityChange={setPriority}
          />
        </div>
      </div>

      <ProjectTable
        projects={filteredProjects}
        onView={setSelectedProject}
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
        open={!!selectedProject}
        title={selectedProject?.project_name ?? "Project Details"}
        subtitle={`Code: ${selectedProject?.project_code ?? ""}`}
        onClose={() => setSelectedProject(null)}
      >
        {selectedProject && (
          <div className="space-y-6">
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Description</h4>
              <p className="mt-1 text-sm text-slate-700">{selectedProject.description || "No description provided."}</p>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-100">
             <Button
  onClick={() => {
    console.log("Selected Project:", selectedProject);
    setSelectedProject(null);
    openAssign(selectedProject!);
  }}
  className="flex items-center gap-2"
>
                <Users className="h-4 w-4" />
                Manage Team Members
              </Button>
            </div>

            <ProjectMemberList
              members={selectedProject.members}
              canManage
            />
          </div>
        )}
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
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Select Role</label>
              <select
                value={memberRole}
                onChange={(e) => setMemberRole(e.target.value as ProjectMemberRole)}
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
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Available Staff</label>
              <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                {employees.map((emp) => {
                  const isSelected = selectedEmployees.includes(emp.id);
                  return (
                    <div
                      key={emp.id}
                      onClick={() => toggleEmployee(emp.id)}
                      className={[
                        "flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors",
                        isSelected ? "border-blue-500 bg-blue-50/50" : "border-slate-100 hover:bg-slate-50",
                      ].join(" ")}
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-900">{emp.full_name}</p>
                        <p className="text-[11px] text-slate-500">{emp.department || "Staff"}</p>
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

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button variant="secondary" onClick={() => setAssignProject(null)}>Cancel</Button>
              <Button onClick={handleAssign} disabled={isPending || selectedEmployees.length === 0}>
                Assign Selected
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={!!projectToDelete}
        title="Confirm Delete"
        subtitle="Are you sure you want to delete this project?"
        onClose={() => setProjectToDelete(null)}
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Deleting <span className="font-bold text-slate-900">{projectToDelete?.project_name}</span> is permanent and cannot be undone.
          </p>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setProjectToDelete(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete} disabled={isPending}>Delete Project</Button>
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
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p>
        <p className="mt-1 text-2xl font-black text-slate-900">{value}</p>
      </div>
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
        <Briefcase className="h-5 w-5" />
      </div>
    </div>
  );
}
