import Badge from "@/components/ui/Badge";

import {
  ATTENDANCE_STATUS,
  AttendanceStatus,
} from "../attendance.types";

interface AttendanceStatusBadgeProps {
  status: AttendanceStatus;
}

export default function AttendanceStatusBadge({
  status,
}: AttendanceStatusBadgeProps) {
  return (
    <Badge
      variant={
        status === ATTENDANCE_STATUS.PRESENT
          ? "success"
          : status === ATTENDANCE_STATUS.INCOMPLETE
            ? "warning"
            : "danger"
      }
    >
      {status}
    </Badge>
  );
}
