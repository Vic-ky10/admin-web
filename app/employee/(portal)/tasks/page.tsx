import EmployeeTaskTable from "@/features/task/components/EmployeeTaskTable";
import {
  getAuthenticatedProfileId,
  getEmployeeTasks,
} from "@/features/task/task.service";

export default async function EmployeeTasksPage() {
  const profileId = await getAuthenticatedProfileId();

  if (!profileId) {
    return null;
  }

  const tasks = await getEmployeeTasks(profileId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          My Tasks
        </h1>

        <p className="text-slate-500">
          View and update your assigned tasks.
        </p>
      </div>

      <EmployeeTaskTable tasks={tasks} />
    </div>
  );
}