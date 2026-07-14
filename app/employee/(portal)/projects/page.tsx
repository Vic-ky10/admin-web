import { redirect } from "next/navigation";

import EmployeeProjectClient from "@/features/project/components/EmployeeProjectClient";
import { getCurrentEmployeeProfile } from "@/features/employee-portal/employee-portal.service";
import { getEmployeeProjects } from "@/features/project/project.service";

export const dynamic = "force-dynamic";

export default async function EmployeeProjectsPage() {
  const profile = await getCurrentEmployeeProfile();

  if (!profile) {
    redirect("/employee/login");
  }

  const projects = await getEmployeeProjects(profile.id);

  return <EmployeeProjectClient projects={projects} />;
}
