"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

import {
  PROJECT_PRIORITY,
  PROJECT_STATUS,
  Project,
} from "../project.types";
import {
  ProjectInput,
  projectSchema,
} from "../project.validation";

interface ProjectFormProps {
  project?: Project | null;
  onSubmit: (values: ProjectInput) => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function ProjectForm({
  project,
  onSubmit,
  onCancel,
  loading = false,
}: ProjectFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProjectInput>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      project_code: project?.project_code ?? "",
      project_name: project?.project_name ?? "",
      description: project?.description ?? "",
      department: "",
      priority: project?.priority ?? PROJECT_PRIORITY.MEDIUM,
      status: project?.status ?? PROJECT_STATUS.PLANNING,
      start_date: project?.start_date ?? "",
      end_date: project?.end_date ?? "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <Input
          label="Project Code"
          error={errors.project_code?.message}
          {...register("project_code")}
        />
        <Input
          label="Project Name"
          error={errors.project_name?.message}
          {...register("project_name")}
        />
      </div>

  

      <label className="space-y-1">
        <span className="text-sm font-semibold text-slate-700">
          Description
        </span>
        <textarea
          {...register("description")}
          rows={4}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        />
        {errors.description?.message && (
          <p className="text-sm text-red-600">{errors.description.message}</p>
        )}
      </label>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="space-y-1">
          <span className="text-sm font-semibold text-slate-700">Status</span>
          <select
            {...register("status")}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          >
            {Object.values(PROJECT_STATUS).map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          {errors.status?.message && (
            <p className="text-sm text-red-600">{errors.status.message}</p>
          )}
        </label>
        <Input
          type="date"
          label="Start Date"
          error={errors.start_date?.message}
          {...register("start_date")}
        />
        <Input
          type="date"
          label="End Date"
          error={errors.end_date?.message}
          {...register("end_date")}
        />
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : project ? "Update Project" : "Create Project"}
        </Button>
      </div>
    </form>
  );
}
