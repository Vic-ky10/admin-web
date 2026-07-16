import Badge from "@/components/ui/Badge";

import { TASK_STATUS } from "../task.types";

interface TaskStatusBadgeProps {
  status: string;
}

export default function TaskStatusBadge({
  status,
}: TaskStatusBadgeProps) {
  switch (status) {
    case TASK_STATUS.COMPLETED:
      return <Badge variant="success">{status}</Badge>;

    case TASK_STATUS.IN_PROGRESS:
      return <Badge variant="info">{status}</Badge>;

    default:
      return <Badge variant="warning">{status}</Badge>;
  }
}