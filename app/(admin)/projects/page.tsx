import { getEmployees } from "@/features/employee/employee.service";
import AdminProjectClient from "@/features/project/components/AdminProjectClient";
import { getProjects } from "@/features/project/project.service";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const [projects, employees] = await Promise.all([
    getProjects(),
    getEmployees(),
  ]);

  return <AdminProjectClient projects={projects} employees={employees} />;
}
