import Badge from "@/components/ui/Badge";

import { LEAVE_STATUS, LeaveStatus } from "../leave.types";

export default function LeaveStatusBadge({
  status,
}: {
  status: LeaveStatus;
}) {
  if (status === LEAVE_STATUS.APPROVED) {
    return <Badge variant="success">{status}</Badge>;
  }

  if (status === LEAVE_STATUS.REJECTED) {
    return <Badge variant="danger">{status}</Badge>;
  }

  if (status === LEAVE_STATUS.PENDING) {
    return <Badge variant="warning">{status}</Badge>;
  }

  return <Badge variant="info">{status}</Badge>;
}
