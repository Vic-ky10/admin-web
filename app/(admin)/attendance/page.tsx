import AdminAttendanceFilters from "@/features/attendance/components/AdminAttendanceFilters";
import AdminAttendanceSummary from "@/features/attendance/components/AdminAttendanceSummary";
import AttendanceHistoryTable from "@/features/attendance/components/AttendanceHistoryTable";
import {
  getAttendanceRecords,
  getAttendanceSummary,
} from "@/features/attendance/attendance.service";
import { AttendanceFilters } from "@/features/attendance/attendance.types";
import { attendanceFiltersSchema } from "@/features/attendance/attendance.validation";
import { getEmployees } from "@/features/employee/employee.service";

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
  const [employees, records, summary] = await Promise.all([
    getEmployees(),
    getAttendanceRecords(filters),
    getAttendanceSummary(filters),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">
          Attendance
        </h1>
        <p className="text-slate-500">
          View employee attendance, filters, and summaries.
        </p>
      </div>

      <AdminAttendanceFilters
        employees={employees}
        defaultValues={filters}
      />

      <AdminAttendanceSummary summary={summary} />

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">
          Attendance Details
        </h2>
        <AttendanceHistoryTable
          records={records}
          showEmployee
        />
      </section>
    </div>
  );
}
