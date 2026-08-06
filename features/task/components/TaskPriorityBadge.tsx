import Badge from "@/components/ui/Badge";

import { TASK_PRIORITY } from "../task.types";

interface TaskPriorityBadgeProps {
  priority: string;
  className?: string;
}

export default function TaskPriorityBadge({
  priority,
  className,
}: TaskPriorityBadgeProps) {
  switch (priority) {
    case TASK_PRIORITY.URGENT:
      return <Badge variant="danger" className={className}>{priority}</Badge>;

    case TASK_PRIORITY.HIGH:
      return <Badge variant="warning" className={className}>{priority}</Badge>;

    case TASK_PRIORITY.MEDIUM:
      return <Badge variant="info" className={className}>{priority}</Badge>;

    default:
      return <Badge variant="success" className={className}>{priority}</Badge>;
  }
}