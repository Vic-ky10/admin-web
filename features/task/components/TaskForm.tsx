"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useState } from "react";

import { ProjectMemberWithEmployee } from "@/features/project/project.types";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import LoadingButton from "@/components/feedback/LoadingButton";

import { Task, TASK_PRIORITY, TASK_STATUS } from "../task.types";

import { taskSchema, TaskInput } from "../task.validation";

import { createTaskAction, updateTaskAction } from "../task.action";
import { getProjectMembersAction } from "@/features/project/project.actions";

interface ProjectOption {
  id: string;
  project_name: string;
  project_code: string;
}

interface TaskFormProps {
  open: boolean;
  task: Task | null;
  projects: ProjectOption[];
  onClose: () => void;
}

export default function TaskForm({
  open,
  task,
  projects,
  onClose,
}: TaskFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TaskInput>({
    resolver: zodResolver(taskSchema) as never,

    defaultValues: {
      project_id: "",
      project_member_id: "",
      title: "",
      description: "",
      priority: TASK_PRIORITY.MEDIUM,
      status: TASK_STATUS.TODO,
      estimated_hours: undefined,
      actual_hours: undefined,
      due_date: "",
    },
  });

  const [projectMembers, setProjectMembers] = useState<
    ProjectMemberWithEmployee[]
  >([]);

  useEffect(() => {
    if (task) {
      reset({
        project_id: task.project_id,
        project_member_id: task.project_member_id,
        title: task.title,
        description: task.description ?? "",
        priority: task.priority as TaskInput["priority"],
        status: task.status as TaskInput["status"],
        estimated_hours: task.estimated_hours ?? undefined,
        actual_hours: task.actual_hours ?? undefined,
        due_date: task.due_date ?? "",
      });
    } else {
      reset();
    }
  }, [task, reset]);

  async function onSubmit(values: TaskInput) {
    const result = task
      ? await updateTaskAction(task.id, values)
      : await createTaskAction(values);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success(result.message);
    window.location.reload();

    reset();
    onClose();
  }

  return (
    <Modal
      open={open}
      title={task ? "Edit Task" : "Create Task"}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Task Title"
          {...register("title")}
          error={errors.title?.message}
        />

        <Input
          label="Description"
          {...register("description")}
          error={errors.description?.message}
        />

        <div className="grid grid-cols-2 gap-4">
          <div><label className="mb-2 block text-sm font-semibold text-slate-700">
            Project</label>

            <select
              {...register("project_id")}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              onChange={async (e) => {
                const projectId = e.target.value;

                if (!projectId) {
                  setProjectMembers([]);
                  return;
                }

                const members = await getProjectMembersAction(projectId);

                setProjectMembers(members);
              }}
            >
              <option value="">Select Project</option>

              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.project_name}
                </option>
              ))}
            </select>

            <p className="mt-1 text-sm text-red-500">
              {errors.project_id?.message}
            </p>
          </div>

          <div>
           <label className="mb-2 block text-sm font-semibold text-slate-700">
              Assign Employee
            </label>

            <select
              {...register("project_member_id")}
             className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            >
              <option value="">Select Employee</option>

              {projectMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.employee?.employee_id} - {member.employee?.full_name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-sm text-red-500">
              {errors.project_member_id?.message}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Priority</label>

            <select
              {...register("priority")}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            >
              {Object.values(TASK_PRIORITY).map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
          </div>

          <div>
           <label className="mb-2 block text-sm font-semibold text-slate-700">Status</label>

            <select
              {...register("status")}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            >
              {Object.values(TASK_STATUS).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Input
            label="Estimated Hours"
            type="number"
            {...register("estimated_hours", {
              valueAsNumber: true,
            })}
            error={errors.estimated_hours?.message}
          />

          <Input
            label="Actual Hours"
            type="number"
            {...register("actual_hours", {
              valueAsNumber: true,
            })}
            error={errors.actual_hours?.message}
          />

          <Input
            label="Due Date"
            type="date"
            {...register("due_date")}
            error={errors.due_date?.message}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>

          <LoadingButton type="submit" loading={isSubmitting}>
            {task ? "Update Task" : "Create Task"}
          </LoadingButton>
        </div>
      </form>
    </Modal>
  );
}
