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
    <>
      <select
        value={status}
        onChange={(event) =>
          onStatusChange(event.target.value as ProjectStatus | "")
        }
        className="h-10 w-full sm:w-[130px] rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      >
        <option value="">Status: All</option>
        {Object.values(PROJECT_STATUS).map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>

      <select
        value={priority}
        onChange={(event) =>
          onPriorityChange(event.target.value as ProjectPriority | "")
        }
        className="h-10 w-full sm:w-[130px] rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      >
        <option value="">Priority: All</option>
        {Object.values(PROJECT_PRIORITY).map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
    </>
  );
}
