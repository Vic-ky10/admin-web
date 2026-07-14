import Link from "next/link";

import { ProjectWithMembers } from "../project.types";
import { formatProjectDate } from "../project.utils";
import {
  ProjectPriorityBadge,
  ProjectStatusBadge,
} from "./ProjectStatusBadge";

export default function ProjectCard({
  project,
  href,
}: {
  project: ProjectWithMembers;
  href?: string;
}) {
  const body = (
    <article className="h-full rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-100/70">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
            {project.project_code}
          </p>
          <h3 className="mt-2 text-lg font-semibold text-slate-950">
            {project.project_name}
          </h3>
        </div>
        <ProjectStatusBadge status={project.status} />
      </div>

      <p className="mt-3 line-clamp-2 min-h-10 text-sm text-slate-500">
        {project.description || "No description added."}
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        <ProjectPriorityBadge priority={project.priority} />
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
          {project.members.length} member(s)
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Start
          </p>
          <p className="mt-1 font-medium text-slate-900">
            {formatProjectDate(project.start_date)}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">End</p>
          <p className="mt-1 font-medium text-slate-900">
            {formatProjectDate(project.end_date)}
          </p>
        </div>
      </div>
    </article>
  );

  if (!href) {
    return body;
  }

  return (
    <Link href={href} className="block h-full">
      {body}
    </Link>
  );
}
