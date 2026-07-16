import TaskTable from "@/features/task/components/TaskTable";
import { getTasks } from "@/features/task/task.service";

import {  getProjects } from "@/features/project/project.service";


export default async function TasksPage() {
  const [tasks, projects] = await Promise.all([
    getTasks(),
    getProjects(),
 
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tasks</h1>

        <p className="text-slate-500">
          Assign, monitor, and manage employee tasks.
        </p>
      </div>

      <TaskTable
        tasks={tasks}
        projects={projects}
        
      />
    </div>
  );
}