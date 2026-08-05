import { redirect } from "next/navigation";

import EmployeeProjectClient from "@/features/project/components/EmployeeProjectClient";
import { getCurrentEmployeeProfile } from "@/features/employee-portal/employee-portal.service";
import { getEmployeeProjects } from "@/features/project/project.service";
import { getEmployeeTasks } from "@/features/task/task.service";

export const dynamic = "force-dynamic";

export default async function EmployeeProjectsPage() {
  const profile = await getCurrentEmployeeProfile();

  if (!profile) {
    redirect("/employee/login");
  }

  const [projects, tasks] = await Promise.all([
    getEmployeeProjects(profile.id),
    getEmployeeTasks(profile.id),
  ]);

  return <EmployeeProjectClient projects={projects} tasks={tasks} profileId={profile.id} />;
}
