import TaskTable from "@/features/task/components/TaskTable";
import { getTasks } from "@/features/task/task.service";
import { getProjects } from "@/features/project/project.service";
import PageHeader from "@/components/layout/PageHeader";

export default async function TasksPage() {
  const [tasks, projects] = await Promise.all([
    getTasks(),
    getProjects(),
  ]);

  return (
    <div className="space-y-6 max-w-[1920px] mx-auto animate-fade-in">
      <PageHeader
        title="Tasks"
        description="Assign, monitor, and track status across team tasks and deadlines."
        breadcrumbs={[{ label: "Admin", href: "/dashboard" }, { label: "Tasks" }]}
      />

      <TaskTable
        tasks={tasks}
        projects={projects}
      />
    </div>
  );
}