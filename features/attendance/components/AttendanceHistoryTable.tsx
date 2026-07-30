import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";

import {
  formatAttendanceDate,
  formatAttendanceTime,
  formatWorkingHours,
} from "../attendance.utils";
import {
  Attendance,
  AttendanceWithEmployee,
} from "../attendance.types";
import AttendanceStatusBadge from "./AttendanceStatusBadge";

interface AttendanceHistoryTableProps {
  records: Attendance[] | AttendanceWithEmployee[];
  showEmployee?: boolean;
}

export default function AttendanceHistoryTable({
  records,
  showEmployee = false,
}: AttendanceHistoryTableProps) {
  if (records.length === 0) {
    return (
      <div className="rounded-xl border bg-white p-10 text-center">
        <h2 className="text-xl font-semibold">
          No Attendance Found
        </h2>
        <p className="mt-2 text-slate-500">
          Attendance records will appear here.
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHead>
        <TableRow>
          {showEmployee && <TableHeader>Employee</TableHeader>}
          <TableHeader>Date</TableHeader>
          <TableHeader>Login</TableHeader>
          <TableHeader>Logout</TableHeader>
          <TableHeader>Working Hours</TableHeader>
          <TableHeader>Status</TableHeader>
       
        </TableRow>
      </TableHead>

      <TableBody>
        {records.map((record) => (
          <TableRow key={record.id}>
            {showEmployee && (
              <TableCell>
                <div className="font-medium text-slate-900">
                  {"employee" in record && record.employee
                    ? record.employee.full_name
                    : record.profile_id}
                </div>
                <div className="text-xs text-slate-500">
                  {"employee" in record && record.employee
                    ? record.employee.employee_id
                    : record.profile_id}
                </div>
              </TableCell>
            )}
            <TableCell>
              {formatAttendanceDate(record.attendance_date)}
            </TableCell>
            <TableCell>
              {formatAttendanceTime(record.login_time)}
            </TableCell>
            <TableCell>
              {formatAttendanceTime(record.logout_time)}
            </TableCell>
            <TableCell>
              {formatWorkingHours(record.working_hours)}
            </TableCell>
            <TableCell>
              <AttendanceStatusBadge status={record.status} />
            </TableCell>
            {/* <TableCell>{record.notes || "-"}</TableCell> */}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
