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
    : status === ATTENDANCE_STATUS.SHORT_HOURS
      ? "warning"
      : status === ATTENDANCE_STATUS.HALF_DAY
        ? "warning"
        : status === ATTENDANCE_STATUS.INCOMPLETE
          ? "info"
          : "danger"

}
    >
      {status}
    </Badge>
  );
}
