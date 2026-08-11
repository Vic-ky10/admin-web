"use client";

import Button from "@/components/ui/Button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";

import { ProjectWithMembers } from "../project.types";
import { formatProjectDate } from "../project.utils";
import {
  ProjectPriorityBadge,
  ProjectStatusBadge,
} from "./ProjectStatusBadge";

interface ProjectTableProps {
  projects: ProjectWithMembers[];
  onView: (project: ProjectWithMembers) => void;
  onEdit: (project: ProjectWithMembers) => void;
  onArchive: (project: ProjectWithMembers) => void;
  onDelete: (project: ProjectWithMembers) => void;
}

export default function ProjectTable({
  projects,
  onView,
  onEdit,
  onArchive,
  onDelete,
}: ProjectTableProps) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeader>Project</TableHeader>
          <TableHeader>Priority</TableHeader>
          <TableHeader>Status</TableHeader>
          <TableHeader>Timeline</TableHeader>
          <TableHeader>Team</TableHeader>
          <TableHeader>Actions</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        {projects.map((project) => (
          <TableRow key={project.id}>
            <TableCell>
              <div>
                <p className="font-semibold text-slate-900">
                  {project.project_name}
                </p>
              </div>
            </TableCell>
            <TableCell>
              <ProjectPriorityBadge priority={project.priority} />
            </TableCell>
            <TableCell>
              <ProjectStatusBadge status={project.status} />
            </TableCell>
            <TableCell>
              {formatProjectDate(project.start_date)} -{" "}
              {formatProjectDate(project.end_date)}
            </TableCell>
            <TableCell>{project.members.length}</TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => onView(project)}
                >
                  View
                </Button>
                <Button type="button" onClick={() => onEdit(project)}>
                  Edit
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  onClick={() => onArchive(project)}
                >
                  Archive
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  onClick={() => onDelete(project)}
                >
                  Delete
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
