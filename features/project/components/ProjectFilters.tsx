"use client";

import {
  PROJECT_PRIORITY,
  PROJECT_STATUS,
  ProjectPriority,
  ProjectStatus,
} from "../project.types";

interface ProjectFiltersProps {
  status: ProjectStatus | "";
  priority: ProjectPriority | "";
  onStatusChange: (value: ProjectStatus | "") => void;
  onPriorityChange: (value: ProjectPriority | "") => void;
}

export default function ProjectFilters({
  status,
  priority,
  onStatusChange,
  onPriorityChange,
}: ProjectFiltersProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="space-y-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Status
        </span>
        <select
          value={status}
          onChange={(event) =>
            onStatusChange(event.target.value as ProjectStatus | "")
          }
          className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        >
          <option value="">All statuses</option>
          {Object.values(PROJECT_STATUS).map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>

      <label className="space-y-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Priority
        </span>
        <select
          value={priority}
          onChange={(event) =>
            onPriorityChange(event.target.value as ProjectPriority | "")
          }
          className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        >
          <option value="">All priorities</option>
          {Object.values(PROJECT_PRIORITY).map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
