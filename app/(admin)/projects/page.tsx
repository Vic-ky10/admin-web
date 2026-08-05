import { getEmployees } from "@/features/employee/employee.service";
import AdminProjectClient from "@/features/project/components/AdminProjectClient";
import { getProjects } from "@/features/project/project.service";
import { getTasks } from "@/features/task/task.service";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const [projects, employees, tasks] = await Promise.all([
    getProjects(),
    getEmployees(),
    getTasks(),
  ]);

  return <AdminProjectClient projects={projects} employees={employees} tasks={tasks} />;
}
