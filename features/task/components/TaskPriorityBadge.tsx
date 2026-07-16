import Badge from "@/components/ui/Badge";

import { TASK_PRIORITY } from "../task.types";

interface TaskPriorityBadgeProps {
  priority: string;
}

export default function TaskPriorityBadge({
  priority,
}: TaskPriorityBadgeProps) {
  switch (priority) {
    case TASK_PRIORITY.URGENT:
      return <Badge variant="danger">{priority}</Badge>;

    case TASK_PRIORITY.HIGH:
      return <Badge variant="warning">{priority}</Badge>;

    case TASK_PRIORITY.MEDIUM:
      return <Badge variant="info">{priority}</Badge>;

    default:
      return <Badge variant="success">{priority}</Badge>;
  }
}