import EmployeeTaskTable from "@/features/task/components/EmployeeTaskTable";
import {
  getAuthenticatedProfileId,
  getEmployeeTasks,
} from "@/features/task/task.service";
import PageHeader from "@/components/layout/PageHeader";

export default async function EmployeeTasksPage() {
  const profileId = await getAuthenticatedProfileId();

  if (!profileId) {
    return null;
  }

  const tasks = await getEmployeeTasks(profileId);

  return (
    <div className="space-y-6 max-w-[1920px] mx-auto animate-fade-in">
      <PageHeader
        title="My Tasks"
        description="View and update your assigned tasks and completion status."
        breadcrumbs={[{ label: "Portal", href: "/employee/dashboard" }, { label: "My Tasks" }]}
      />

      <EmployeeTaskTable tasks={tasks} profileId={profileId} />
    </div>
  );
}