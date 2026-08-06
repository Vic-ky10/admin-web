import Badge from "@/components/ui/Badge";

import { TASK_STATUS } from "../task.types";

interface TaskStatusBadgeProps {
  status: string;
  className?: string;
}

export default function TaskStatusBadge({
  status,
  className,
}: TaskStatusBadgeProps) {
  switch (status) {
    case TASK_STATUS.COMPLETED:
      return <Badge variant="success" className={className}>{status}</Badge>;

    case TASK_STATUS.IN_PROGRESS:
      return <Badge variant="info" className={className}>{status}</Badge>;

    default:
      return <Badge variant="warning" className={className}>{status}</Badge>;
  }
}