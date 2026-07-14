import Badge from "@/components/ui/Badge";

import { ProjectPriority, ProjectStatus } from "../project.types";
import {
  getProjectPriorityTone,
  getProjectStatusTone,
} from "../project.utils";

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  return <Badge variant={getProjectStatusTone(status)}>{status}</Badge>;
}

export function ProjectPriorityBadge({
  priority,
}: {
  priority: ProjectPriority;
}) {
  return <Badge variant={getProjectPriorityTone(priority)}>{priority}</Badge>;
}
