import AdminAttendanceFilters from "@/features/attendance/components/AdminAttendanceFilters";
import AttendanceClient from "@/features/attendance/components/AttendanceClient";

import { AttendanceFilters } from "@/features/attendance/attendance.types";
import { attendanceFiltersSchema } from "@/features/attendance/attendance.validation";
import { getEmployees } from "@/features/employee/employee.service";
import { getTodayAttendanceDashboard } from "@/features/attendance/attendance.service";

export const dynamic = "force-dynamic";

interface AdminAttendancePageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function AdminAttendancePage({
  searchParams,
}: AdminAttendancePageProps) {
  const params = await searchParams;
  const filters = attendanceFiltersSchema.parse({
    profileId: params.profileId,
    date: params.date,
    status: params.status,
    search: params.search,
  }) as AttendanceFilters;
 const [employees, dashboard] = await Promise.all([
  getEmployees(),
  getTodayAttendanceDashboard(),
]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Attendance</h1>
        <p className="text-slate-500">
          View employee attendance, filters, and summaries.
        </p>
      </div>

      <AdminAttendanceFilters employees={employees} defaultValues={filters} />
      <AttendanceClient
  summary={dashboard.summary}
  presentRecords={dashboard.present}
  incompleteRecords={dashboard.incomplete}
  absentRecords={dashboard.absent}
/>
    </div>
  );
}
